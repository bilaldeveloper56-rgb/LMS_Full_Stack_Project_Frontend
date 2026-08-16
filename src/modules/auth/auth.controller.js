import * as authService from './auth.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import { env } from '../../config/env.js';
import { HTTP_STATUS } from '../../constants/index.js';

/**
 * Cookie options for refresh token.
 */
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: parseCookieMaxAge(env.JWT_REFRESH_EXPIRES_IN),
  ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
});

/**
 * Parse duration string to milliseconds for cookie maxAge.
 */
const parseCookieMaxAge = (duration) => {
  const units = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  return parseInt(match[1]) * units[match[2]];
};

/**
 * Set refresh token cookie on response.
 */
const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, getRefreshCookieOptions());
};

/**
 * Clear refresh token cookie.
 */
const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/api/v1/auth',
    ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
  });
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedBody;
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const result = await authService.login(email, password, meta);

  setRefreshCookie(res, result.refreshToken);

  sendSuccess(res, HTTP_STATUS.OK, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const result = await authService.refreshTokens(token, meta);

  setRefreshCookie(res, result.refreshToken);

  sendSuccess(res, HTTP_STATUS.OK, 'Token refreshed', {
    accessToken: result.accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  await authService.logout(token);

  clearRefreshCookie(res);

  sendSuccess(res, HTTP_STATUS.OK, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  sendSuccess(res, HTTP_STATUS.OK, 'User profile retrieved', { user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.validatedBody);
  sendSuccess(res, HTTP_STATUS.OK, 'Profile updated', { user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validatedBody;
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  clearRefreshCookie(res);

  sendSuccess(res, HTTP_STATUS.OK, 'Password changed. Please login again.');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validatedBody;
  await authService.forgotPassword(email);

  // Always return success to prevent email enumeration
  sendSuccess(res, HTTP_STATUS.OK, 'If an account with that email exists, a password reset link has been sent.');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.validatedBody;
  await authService.resetPassword(token, password);

  clearRefreshCookie(res);

  sendSuccess(res, HTTP_STATUS.OK, 'Password reset successful. Please login with your new password.');
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.validatedBody;
  const user = await authService.verifyEmail(token);
  sendSuccess(res, HTTP_STATUS.OK, 'Email verified successfully', { user });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.validatedBody;
  await authService.resendVerification(email);

  sendSuccess(res, HTTP_STATUS.OK, 'If the email is registered and not yet verified, a verification link has been sent.');
});
