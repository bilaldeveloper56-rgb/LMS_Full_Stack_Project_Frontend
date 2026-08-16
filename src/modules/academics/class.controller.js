import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as classService from './class.service.js';

export const createClass = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const cls = await classService.createClass(req.body, req.user, meta);
  sendCreated(res, 'Class created successfully', cls);
});

export const getClasses = asyncHandler(async (req, res) => {
  const result = await classService.getClasses(req.query, req.user);
  sendPaginated(res, 'Classes retrieved successfully', result.classes, result.pagination);
});

export const getClassById = asyncHandler(async (req, res) => {
  const cls = await classService.getClassById(req.params.id, req.user);
  sendSuccess(res, 200, 'Class retrieved successfully', cls);
});

export const updateClass = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const cls = await classService.updateClass(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Class updated successfully', cls);
});

export const deleteClass = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await classService.deleteClass(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});
