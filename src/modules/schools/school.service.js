import crypto from 'node:crypto';
import mongoose from 'mongoose';
import School from './school.model.js';
import User from '../users/user.model.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import AppError from '../../utils/AppError.js';
import { ROLES, USER_STATUS, SCHOOL_STATUS, AUTH_EVENTS } from '../../constants/index.js';
import { sendEmail } from '../../providers/email.provider.js';
import { schoolAdminInvitationEmail } from '../../templates/emails/schoolAdminInvitation.js';
import { welcomeEmail } from '../../templates/emails/welcome.js';
import { logAuditEvent } from '../audit/audit.service.js';

// Helper to hash tokens
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Helper to parse duration strings
function parseDuration(str) {
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const val = parseInt(match[1]);
  const unit = match[2];
  const units = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return val * units[unit];
}

/**
 * Provision a new School along with its initial School Administrator.
 * Performs validation, atomic creation, token generation, and invitation delivery.
 *
 * @param {Object} schoolData - School payload
 * @param {Object} adminData - Initial School Admin payload
 * @param {string} superAdminId - ID of the creating Super Admin
 * @param {Object} [meta] - Request metadata (IP, UA)
 * @returns {Promise<{ school: Object, admin: Object }>}
 */
export async function createSchoolWithAdmin(schoolData, adminData, superAdminId, meta = {}) {
  // 1. Validate uniqueness
  const existingCode = await School.findOne({ schoolCode: schoolData.schoolCode.toUpperCase() });
  if (existingCode) {
    throw AppError.conflict(`School code '${schoolData.schoolCode.toUpperCase()}' is already in use`);
  }

  const existingSchoolEmail = await School.findOne({ email: schoolData.email.toLowerCase() });
  if (existingSchoolEmail) {
    throw AppError.conflict(`School email '${schoolData.email.toLowerCase()}' is already registered`);
  }

  const existingAdminUser = await User.findOne({ email: adminData.email.toLowerCase() });
  if (existingAdminUser) {
    throw AppError.conflict(`Admin email '${adminData.email.toLowerCase()}' is already registered`);
  }

  // 2. Transaction support (enabled when MongoDB connection is active)
  let session = null;
  let useTransaction = false;

  if (mongoose.connection.readyState === 1) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch (err) {
      // Standalone MongoDB does not support transactions; proceed without session
      session = null;
      useTransaction = false;
    }
  }

  let createdSchool = null;
  let createdAdmin = null;
  const rawInvitationToken = crypto.randomBytes(32).toString('hex');
  const hashedInvitationToken = hashToken(rawInvitationToken);
  const invitationExpires = new Date(Date.now() + parseDuration(env.INVITATION_EXPIRES_IN));

  try {
    // 3. Create School
    const schoolToSave = new School({
      ...schoolData,
      schoolCode: schoolData.schoolCode.toUpperCase(),
      email: schoolData.email.toLowerCase(),
      createdBy: superAdminId,
    });

    createdSchool = useTransaction
      ? await schoolToSave.save({ session })
      : await schoolToSave.save();

    // 4. Create Initial School Admin (INVITED status)
    // Generate temporary password hash that will be replaced upon invitation acceptance
    const tempPasswordHash = await User.hashPassword(crypto.randomBytes(32).toString('hex'));

    const adminToSave = new User({
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email.toLowerCase(),
      phone: adminData.phone || null,
      passwordHash: tempPasswordHash,
      role: ROLES.SCHOOL_ADMIN,
      status: USER_STATUS.INVITED,
      schoolId: createdSchool._id,
      emailVerified: false,
      invitationToken: hashedInvitationToken,
      invitationExpires: invitationExpires,
      invitedBy: superAdminId,
      invitedAt: new Date(),
    });

    createdAdmin = useTransaction
      ? await adminToSave.save({ session })
      : await adminToSave.save();

    if (useTransaction) {
      await session.commitTransaction();
    }
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction();
    } else if (createdSchool) {
      // Manual cleanup fallback if transaction not available
      await School.findByIdAndDelete(createdSchool._id).catch(() => {});
      if (createdAdmin) {
        await User.findByIdAndDelete(createdAdmin._id).catch(() => {});
      }
    }

    await logAuditEvent({
      event: AUTH_EVENTS.PROVISIONING_FAILED,
      userId: superAdminId,
      entityType: 'School',
      details: {
        schoolCode: schoolData.schoolCode,
        adminEmail: adminData.email,
        error: error.message,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  // 5. Audit Logging
  await logAuditEvent({
    event: AUTH_EVENTS.SCHOOL_CREATED,
    userId: superAdminId,
    schoolId: createdSchool._id,
    entityType: 'School',
    entityId: createdSchool._id,
    details: {
      name: createdSchool.name,
      schoolCode: createdSchool.schoolCode,
      adminId: createdAdmin._id,
      adminEmail: createdAdmin.email,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  await logAuditEvent({
    event: AUTH_EVENTS.SCHOOL_ADMIN_INVITED,
    userId: superAdminId,
    schoolId: createdSchool._id,
    entityType: 'User',
    entityId: createdAdmin._id,
    details: {
      adminEmail: createdAdmin.email,
      role: ROLES.SCHOOL_ADMIN,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  // 6. Send Invitation Email
  const invitationUrl = `${env.FRONTEND_URL}/accept-invitation?token=${rawInvitationToken}`;
  const emailContent = schoolAdminInvitationEmail({
    firstName: createdAdmin.firstName,
    schoolName: createdSchool.name,
    invitationUrl,
    expiresIn: env.INVITATION_EXPIRES_IN,
  });

  await sendEmail({ to: createdAdmin.email, ...emailContent });

  return {
    school: createdSchool.toJSON(),
    admin: createdAdmin.toJSON(),
  };
}

/**
 * Accept School Admin invitation and complete account activation.
 *
 * @param {string} token - Raw invitation token from email
 * @param {string} newPassword - Chosen secure password
 * @param {Object} [meta] - Request metadata
 * @returns {Promise<Object>} activated user representation
 */
export async function acceptInvitation(token, newPassword, meta = {}) {
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    invitationToken: hashedToken,
    invitationExpires: { $gt: new Date() },
  }).select('+invitationToken +invitationExpires');

  if (!user) {
    throw AppError.badRequest('Invalid or expired invitation token');
  }

  user.passwordHash = await User.hashPassword(newPassword);
  user.status = USER_STATUS.ACTIVE;
  user.emailVerified = true;
  user.invitationToken = undefined;
  user.invitationExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();

  await logAuditEvent({
    event: AUTH_EVENTS.SCHOOL_ADMIN_ACTIVATED,
    userId: user._id,
    schoolId: user.schoolId,
    entityType: 'User',
    entityId: user._id,
    details: { email: user.email, role: user.role },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  // Send Welcome Email
  const welcomeContent = welcomeEmail({
    firstName: user.firstName,
    loginUrl: `${env.FRONTEND_URL}/login`,
  });
  await sendEmail({ to: user.email, ...welcomeContent });

  return user.toJSON();
}

/**
 * List schools with search, status filtering, sorting, and pagination.
 *
 * @param {Object} params - Query parameters
 * @returns {Promise<{ schools: Array, pagination: Object }>}
 */
export async function getSchools(params) {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = [
      { name: searchRegex },
      { schoolCode: searchRegex },
      { email: searchRegex },
      { city: searchRegex },
      { country: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [schools, total] = await Promise.all([
    School.find(query).sort(sort).skip(skip).limit(limit),
    School.countDocuments(query),
  ]);

  return {
    schools: schools.map((s) => s.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Retrieve a school by its MongoDB ObjectId.
 *
 * @param {string} schoolId
 * @returns {Promise<Object>}
 */
export async function getSchoolById(schoolId) {
  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    throw AppError.badRequest('Invalid school ID format');
  }

  const school = await School.findById(schoolId);
  if (!school) {
    throw AppError.notFound('School not found');
  }

  return school.toJSON();
}

/**
 * Retrieve a school by its unique schoolCode.
 *
 * @param {string} schoolCode
 * @returns {Promise<Object>}
 */
export async function getSchoolByCode(schoolCode) {
  const school = await School.findOne({ schoolCode: schoolCode.toUpperCase() });
  if (!school) {
    throw AppError.notFound(`School with code '${schoolCode}' not found`);
  }

  return school.toJSON();
}

/**
 * Update school profile information.
 * Prevents mutation of immutable fields (schoolCode, createdBy, isDeleted).
 *
 * @param {string} schoolId
 * @param {Object} updates
 * @param {string} updatedById
 * @param {Object} [meta]
 * @returns {Promise<Object>}
 */
export async function updateSchool(schoolId, updates, updatedById, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    throw AppError.badRequest('Invalid school ID format');
  }

  // Prevent immutable field mutation
  delete updates.schoolCode;
  delete updates.createdBy;
  delete updates.isDeleted;
  delete updates.deletedAt;
  delete updates.deletedBy;
  delete updates._id;

  const school = await School.findByIdAndUpdate(
    schoolId,
    { ...updates, updatedBy: updatedById },
    { new: true, runValidators: true }
  );

  if (!school) {
    throw AppError.notFound('School not found');
  }

  await logAuditEvent({
    event: AUTH_EVENTS.SCHOOL_UPDATED,
    userId: updatedById,
    schoolId: school._id,
    entityType: 'School',
    entityId: school._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return school.toJSON();
}

/**
 * Change school lifecycle status (ACTIVE, SUSPENDED, EXPIRED, INACTIVE, GRACE_PERIOD).
 *
 * @param {string} schoolId
 * @param {string} newStatus
 * @param {string} updatedById
 * @param {string} [reason]
 * @param {Object} [meta]
 * @returns {Promise<Object>}
 */
export async function changeSchoolStatus(schoolId, newStatus, updatedById, reason = '', meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    throw AppError.badRequest('Invalid school ID format');
  }

  const school = await School.findById(schoolId);
  if (!school) {
    throw AppError.notFound('School not found');
  }

  const oldStatus = school.status;
  school.status = newStatus;
  school.updatedBy = updatedById;
  await school.save();

  // Determine specific audit event
  let auditEvent = AUTH_EVENTS.SCHOOL_STATUS_CHANGED;
  if (newStatus === SCHOOL_STATUS.SUSPENDED) {
    auditEvent = AUTH_EVENTS.SCHOOL_SUSPENDED;
  } else if (newStatus === SCHOOL_STATUS.ACTIVE && oldStatus === SCHOOL_STATUS.SUSPENDED) {
    auditEvent = AUTH_EVENTS.SCHOOL_REACTIVATED;
  } else if (newStatus === SCHOOL_STATUS.ACTIVE) {
    auditEvent = AUTH_EVENTS.SCHOOL_ACTIVATED;
  } else if (newStatus === SCHOOL_STATUS.EXPIRED) {
    auditEvent = AUTH_EVENTS.SCHOOL_EXPIRED;
  }

  await logAuditEvent({
    event: auditEvent,
    userId: updatedById,
    schoolId: school._id,
    entityType: 'School',
    entityId: school._id,
    details: { oldStatus, newStatus, reason },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return school.toJSON();
}

/**
 * Resend School Admin invitation email with a fresh token.
 *
 * @param {string} schoolId
 * @param {string} superAdminId
 * @param {Object} [meta]
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function resendAdminInvitation(schoolId, superAdminId, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    throw AppError.badRequest('Invalid school ID format');
  }

  const school = await School.findById(schoolId);
  if (!school) {
    throw AppError.notFound('School not found');
  }

  const admin = await User.findOne({
    schoolId: school._id,
    role: ROLES.SCHOOL_ADMIN,
    status: USER_STATUS.INVITED,
  });

  if (!admin) {
    throw AppError.badRequest('No pending administrator invitation found for this school');
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  admin.invitationToken = hashToken(rawToken);
  admin.invitationExpires = new Date(Date.now() + parseDuration(env.INVITATION_EXPIRES_IN));
  admin.invitedAt = new Date();
  admin.invitedBy = superAdminId;
  await admin.save({ validateBeforeSave: false });

  await logAuditEvent({
    event: AUTH_EVENTS.SCHOOL_ADMIN_INVITED,
    userId: superAdminId,
    schoolId: school._id,
    entityType: 'User',
    entityId: admin._id,
    details: { adminEmail: admin.email, isResend: true },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  const invitationUrl = `${env.FRONTEND_URL}/accept-invitation?token=${rawToken}`;
  const emailContent = schoolAdminInvitationEmail({
    firstName: admin.firstName,
    schoolName: school.name,
    invitationUrl,
    expiresIn: env.INVITATION_EXPIRES_IN,
  });

  await sendEmail({ to: admin.email, ...emailContent });

  return { success: true, message: 'Invitation email resent successfully' };
}

/**
 * Retrieve high-level statistics across all schools for SUPER_ADMIN dashboard.
 *
 * @returns {Promise<Object>}
 */
export async function getSchoolStats() {
  const [total, active, gracePeriod, suspended, expired, inactive] = await Promise.all([
    School.countDocuments(),
    School.countDocuments({ status: SCHOOL_STATUS.ACTIVE }),
    School.countDocuments({ status: SCHOOL_STATUS.GRACE_PERIOD }),
    School.countDocuments({ status: SCHOOL_STATUS.SUSPENDED }),
    School.countDocuments({ status: SCHOOL_STATUS.EXPIRED }),
    School.countDocuments({ status: SCHOOL_STATUS.INACTIVE }),
  ]);

  return {
    total,
    byStatus: {
      active,
      gracePeriod,
      suspended,
      expired,
      inactive,
    },
  };
}
