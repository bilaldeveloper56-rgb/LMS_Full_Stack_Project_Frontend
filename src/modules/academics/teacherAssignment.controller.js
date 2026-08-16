import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as assignmentService from './teacherAssignment.service.js';

export const createTeacherAssignment = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const assignment = await assignmentService.createTeacherAssignment(req.body, req.user, meta);
  sendCreated(res, 'Teacher assignment created successfully', assignment);
});

export const getTeacherAssignments = asyncHandler(async (req, res) => {
  const result = await assignmentService.getTeacherAssignments(req.query, req.user);
  sendPaginated(res, 'Teacher assignments retrieved successfully', result.assignments, result.pagination);
});

export const getTeacherAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.getTeacherAssignmentById(req.params.id, req.user);
  sendSuccess(res, 200, 'Teacher assignment retrieved successfully', assignment);
});

export const updateTeacherAssignment = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const assignment = await assignmentService.updateTeacherAssignment(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Teacher assignment updated successfully', assignment);
});

export const deleteTeacherAssignment = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await assignmentService.deleteTeacherAssignment(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});
