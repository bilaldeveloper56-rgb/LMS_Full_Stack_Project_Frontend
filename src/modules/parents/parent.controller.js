import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as parentService from './parent.service.js';

export const createParent = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const parent = await parentService.createParent(req.body, req.user, meta);
  sendCreated(res, 'Parent created successfully', parent);
});

export const getParents = asyncHandler(async (req, res) => {
  const result = await parentService.getParents(req.query, req.user);
  sendPaginated(res, 'Parents retrieved successfully', result.parents, result.pagination);
});

export const getParentById = asyncHandler(async (req, res) => {
  const parent = await parentService.getParentById(req.params.id, req.user);
  sendSuccess(res, 200, 'Parent retrieved successfully', parent);
});

export const updateParent = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const parent = await parentService.updateParent(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Parent updated successfully', parent);
});

export const deleteParent = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await parentService.deleteParent(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});

export const getParentChildren = asyncHandler(async (req, res) => {
  const children = await parentService.getParentChildren(req.params.id, req.user);
  sendSuccess(res, 200, "Parent's children retrieved successfully", children);
});
