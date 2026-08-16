import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as leaveService from './leave.service.js';

export const createLeave = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const leave = await leaveService.createLeave(req.body, req.user, meta);
  sendCreated(res, 'Leave request submitted successfully', leave);
});

export const listLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.listLeaves(req.query, req.user);
  sendPaginated(res, 'Leave requests retrieved successfully', result.leaves, result.pagination);
});

export const getLeaveById = asyncHandler(async (req, res) => {
  const leave = await leaveService.getLeaveById(req.params.id, req.user);
  sendSuccess(res, 200, 'Leave request retrieved successfully', leave);
});

export const updateLeave = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const leave = await leaveService.updateLeave(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Leave request updated successfully', leave);
});

export const cancelLeave = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const leave = await leaveService.cancelLeave(req.params.id, req.user, meta);
  sendSuccess(res, 200, 'Leave request cancelled successfully', leave);
});

export const approveLeave = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const leave = await leaveService.approveLeave(req.params.id, req.user, meta);
  sendSuccess(res, 200, 'Leave request approved successfully', leave);
});

export const rejectLeave = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const leave = await leaveService.rejectLeave(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Leave request rejected successfully', leave);
});

export const deleteLeave = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await leaveService.deleteLeave(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});

export const getMyLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.getMyLeaves(req.query, req.user);
  sendPaginated(res, 'My leave requests retrieved successfully', result.leaves, result.pagination);
});

export const getStudentLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.getStudentLeaves(req.params.studentId, req.query, req.user);
  sendPaginated(res, 'Student leave requests retrieved successfully', result.leaves, result.pagination);
});

export const getTeacherLeaves = asyncHandler(async (req, res) => {
  const result = await leaveService.getTeacherLeaves(req.params.teacherId, req.query, req.user);
  sendPaginated(res, 'Teacher leave requests retrieved successfully', result.leaves, result.pagination);
});
