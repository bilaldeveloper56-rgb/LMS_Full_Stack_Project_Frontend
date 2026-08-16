import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as studentParentService from './studentParent.service.js';

export const createStudentParentLink = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const link = await studentParentService.createStudentParentLink(req.body, req.user, meta);
  sendCreated(res, 'Student linked to parent successfully', link);
});

export const getStudentParentLinks = asyncHandler(async (req, res) => {
  const result = await studentParentService.getStudentParentLinks(req.query, req.user);
  sendPaginated(res, 'Student-parent links retrieved successfully', result.links, result.pagination);
});

export const updateStudentParentLink = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const link = await studentParentService.updateStudentParentLink(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Student-parent link updated successfully', link);
});

export const deleteStudentParentLink = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await studentParentService.deleteStudentParentLink(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});

export const getStudentParents = asyncHandler(async (req, res) => {
  const parents = await studentParentService.getStudentParents(req.params.id, req.user);
  sendSuccess(res, 200, "Student's parents retrieved successfully", parents);
});
