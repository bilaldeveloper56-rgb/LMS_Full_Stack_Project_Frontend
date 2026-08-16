import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../users/user.model.js';
import RefreshToken from './refreshToken.model.js';
import School from '../schools/school.model.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { sendEmail } from '../../providers/email.provider.js';
import { passwordResetEmail } from '../../templates/emails/passwordReset.js';
import { emailVerificationEmail } from '../../templates/emails/emailVerification.js';
import AppError from '../../utils/AppError.js';
import { USER_STATUS, SCHOOL_STATUS, AUTH_EVENTS } from '../../constants/index.js';

// Helper functions (NOT exported)
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      schoolId: user.schoolId?.toString() || null,
      type: 'access'
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
}

function generateRefreshTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseDuration(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const val = parseInt(match[1]);
  const unit = match[2];
  const units = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return val * units[unit];
}

// Exported async functions

export async function login(email, password, meta = {}) {
  const user = await User.findOne({ email }).select('+passwordHash');
  
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }
  if (user.status === USER_STATUS.SUSPENDED) {
    throw AppError.forbidden('Account suspended. Contact administrator.');
  }
  if (user.status === USER_STATUS.DISABLED) {
    throw AppError.forbidden('Account disabled. Contact administrator.');
  }
  if (user.status === USER_STATUS.INVITED) {
    throw AppError.forbidden('Please complete your account setup first.');
  }

  // School status verification for school-level users (SUPER_ADMIN has schoolId = null)
  if (user.schoolId) {
    const school = await School.findById(user.schoolId);
    if (!school || school.isDeleted) {
      throw AppError.forbidden('School associated with this account not found.');
    }
    if (school.status === SCHOOL_STATUS.INACTIVE) {
      throw AppError.forbidden('School account is inactive. Please contact platform support.');
    }
    if (school.status === SCHOOL_STATUS.SUSPENDED) {
      throw AppError.forbidden('School account is suspended. Please contact platform support.');
    }
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw AppError.unauthorized('Invalid email or password');
  }
  
  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshTokenString();
  const tokenHash = hashToken(rawRefreshToken);
  const familyId = crypto.randomUUID();
  
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    familyId,
    expiresAt: new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN)),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress
  });
  
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  
  logger.info(AUTH_EVENTS.LOGIN_SUCCESS, { userId: user._id });
  
  return { user: user.toJSON(), accessToken, refreshToken: rawRefreshToken };
}

export async function refreshTokens(rawRefreshToken, meta = {}) {
  if (!rawRefreshToken) {
    throw AppError.unauthorized('Refresh token required');
  }
  
  const tokenHash = hashToken(rawRefreshToken);
  const tokenRecord = await RefreshToken.findOne({ tokenHash });
  
  if (!tokenRecord) {
    throw AppError.unauthorized('Invalid refresh token');
  }
  
  if (tokenRecord.isRevoked()) {
    logger.warn(AUTH_EVENTS.REFRESH_TOKEN_REVOKED, { userId: tokenRecord.userId });
    await RefreshToken.updateMany(
      { familyId: tokenRecord.familyId },
      { revokedAt: new Date() }
    );
    throw AppError.unauthorized('Suspicious activity detected. Please login again.');
  }
  
  if (tokenRecord.isExpired()) {
    throw AppError.unauthorized('Refresh token expired. Please login again.');
  }
  
  const user = await User.findById(tokenRecord.userId);
  if (!user || (user.status !== USER_STATUS.ACTIVE && user.status !== USER_STATUS.PENDING)) {
    throw AppError.unauthorized('Account not accessible');
  }
  
  tokenRecord.revokedAt = new Date();
  tokenRecord.lastUsedAt = new Date();
  
  const newRawRefreshToken = generateRefreshTokenString();
  const newTokenHash = hashToken(newRawRefreshToken);
  
  const newRecord = await RefreshToken.create({
    userId: user._id,
    tokenHash: newTokenHash,
    familyId: tokenRecord.familyId,
    expiresAt: new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN)),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress
  });
  
  tokenRecord.replacedByTokenId = newRecord._id;
  await tokenRecord.save();
  
  const accessToken = generateAccessToken(user);
  
  return { accessToken, refreshToken: newRawRefreshToken };
}

export async function logout(rawRefreshToken) {
  if (!rawRefreshToken) return;
  
  const tokenHash = hashToken(rawRefreshToken);
  const tokenRecord = await RefreshToken.findOne({ tokenHash });
  
  if (tokenRecord && !tokenRecord.isRevoked()) {
    tokenRecord.revokedAt = new Date();
    await tokenRecord.save();
  }
  
  logger.info(AUTH_EVENTS.LOGOUT);
}

export async function logoutAllSessions(userId) {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw AppError.notFound('User not found');
  
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw AppError.badRequest('Current password is incorrect');
  
  user.passwordHash = await User.hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save({ validateBeforeSave: false });
  
  await logoutAllSessions(userId);
  logger.info(AUTH_EVENTS.PASSWORD_CHANGED, { userId });
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) return;
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(resetToken);
  
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + parseDuration(env.PASSWORD_RESET_EXPIRES_IN));
  await user.save({ validateBeforeSave: false });
  
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const emailContent = passwordResetEmail({ 
    firstName: user.firstName, 
    resetUrl, 
    expiresIn: env.PASSWORD_RESET_EXPIRES_IN 
  });
  
  await sendEmail({ to: user.email, ...emailContent });
  logger.info(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, { userId: user._id });
}

export async function resetPassword(token, newPassword) {
  const hashedToken = hashToken(token);
  const user = await User.findOne({ 
    passwordResetToken: hashedToken, 
    passwordResetExpires: { $gt: new Date() } 
  }).select('+passwordResetToken +passwordResetExpires');
  
  if (!user) {
    throw AppError.badRequest('Invalid or expired reset token');
  }
  
  user.passwordHash = await User.hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  await logoutAllSessions(user._id);
  logger.info(AUTH_EVENTS.PASSWORD_RESET_COMPLETED, { userId: user._id });
}

export async function verifyEmail(token) {
  const hashedToken = hashToken(token);
  const user = await User.findOne({ 
    emailVerificationToken: hashedToken, 
    emailVerificationExpires: { $gt: new Date() } 
  }).select('+emailVerificationToken +emailVerificationExpires');
  
  if (!user) {
    throw AppError.badRequest('Invalid or expired verification token');
  }
  
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  if (user.status === USER_STATUS.PENDING) {
    user.status = USER_STATUS.ACTIVE;
  }
  await user.save();
  
  logger.info(AUTH_EVENTS.EMAIL_VERIFIED, { userId: user._id });
  return user.toJSON();
}

export async function resendVerification(email) {
  const user = await User.findOne({ email });
  if (!user) return;
  
  if (user.emailVerified) {
    throw AppError.badRequest('Email is already verified');
  }
  
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(verificationToken);
  
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = new Date(Date.now() + parseDuration(env.EMAIL_VERIFICATION_EXPIRES_IN));
  await user.save();
  
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const emailContent = emailVerificationEmail({ 
    firstName: user.firstName, 
    verificationUrl, 
    expiresIn: env.EMAIL_VERIFICATION_EXPIRES_IN 
  });
  
  await sendEmail({ to: user.email, ...emailContent });
  logger.info(AUTH_EVENTS.EMAIL_VERIFICATION_REQUESTED, { userId: user._id });
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');
  return user.toJSON();
}

export async function updateProfile(userId, updates) {
  const allowedUpdates = {};
  if (updates.firstName !== undefined) allowedUpdates.firstName = updates.firstName;
  if (updates.lastName !== undefined) allowedUpdates.lastName = updates.lastName;
  if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;
  
  const user = await User.findByIdAndUpdate(userId, allowedUpdates, { new: true, runValidators: true });
  if (!user) throw AppError.notFound('User not found');
  return user.toJSON();
}
