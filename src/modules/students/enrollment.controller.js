import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as enrollmentService from './enrollment.service.js';

export const createEnrollment = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const enrollment = await enrollmentService.createEnrollment(req.body, req.user, meta);
  sendCreated(res, 'Student enrolled successfully', enrollment);
});

export const getEnrollments = asyncHandler(async (req, res) => {
  const result = await enrollmentService.getEnrollments(req.query, req.user);
  sendPaginated(res, 'Enrollments retrieved successfully', result.enrollments, result.pagination);
});

export const getEnrollmentById = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentService.getEnrollmentById(req.params.id, req.user);
  sendSuccess(res, 200, 'Enrollment retrieved successfully', enrollment);
});

export const updateEnrollment = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const enrollment = await enrollmentService.updateEnrollment(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Enrollment updated successfully', enrollment);
});

export const deleteEnrollment = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await enrollmentService.deleteEnrollment(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});

export const getStudentEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentService.getStudentEnrollments(req.params.id, req.user);
  sendSuccess(res, 200, 'Student enrollments retrieved successfully', enrollments);
});
