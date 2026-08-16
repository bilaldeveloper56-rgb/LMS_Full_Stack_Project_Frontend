import * as schoolService from './school.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import { HTTP_STATUS, ROLES } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

export const createSchool = asyncHandler(async (req, res) => {
  const { school, admin } = req.validatedBody;
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const result = await schoolService.createSchoolWithAdmin(
    school,
    admin,
    req.user.id,
    meta
  );

  sendCreated(res, 'School provisioned and administrator invited successfully', result);
});

export const getSchools = asyncHandler(async (req, res) => {
  const result = await schoolService.getSchools(req.validatedQuery || req.query);
  sendPaginated(res, 'Schools retrieved successfully', result.schools, result.pagination);
});

export const getSchoolStats = asyncHandler(async (req, res) => {
  const stats = await schoolService.getSchoolStats();
  sendSuccess(res, HTTP_STATUS.OK, 'School statistics retrieved successfully', stats);
});

export const getMySchool = asyncHandler(async (req, res) => {
  if (!req.user.schoolId) {
    throw AppError.badRequest('User does not belong to any school');
  }

  const school = await schoolService.getSchoolById(req.user.schoolId);
  sendSuccess(res, HTTP_STATUS.OK, 'School profile retrieved successfully', { school });
});

export const getSchoolById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Tenant Boundary Check: Non-SUPER_ADMIN can only view their own school
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.schoolId !== id) {
    throw AppError.forbidden('Access denied. You cannot view data from another school.');
  }

  const school = await schoolService.getSchoolById(id);
  sendSuccess(res, HTTP_STATUS.OK, 'School details retrieved successfully', { school });
});

export const updateSchool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const school = await schoolService.updateSchool(
    id,
    req.validatedBody,
    req.user.id,
    meta
  );

  sendSuccess(res, HTTP_STATUS.OK, 'School updated successfully', { school });
});

export const changeSchoolStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.validatedBody;
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const school = await schoolService.changeSchoolStatus(
    id,
    status,
    req.user.id,
    reason,
    meta
  );

  sendSuccess(res, HTTP_STATUS.OK, `School status changed to ${status}`, { school });
});

export const resendAdminInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const result = await schoolService.resendAdminInvitation(id, req.user.id, meta);
  sendSuccess(res, HTTP_STATUS.OK, result.message);
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  const { token, password } = req.validatedBody;
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };

  const user = await schoolService.acceptInvitation(token, password, meta);
  sendSuccess(
    res,
    HTTP_STATUS.OK,
    'Account activated successfully. You can now log in with your credentials.',
    { user }
  );
});
