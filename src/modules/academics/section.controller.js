import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as sectionService from './section.service.js';

export const createSection = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const section = await sectionService.createSection(req.body, req.user, meta);
  sendCreated(res, 'Section created successfully', section);
});

export const getSections = asyncHandler(async (req, res) => {
  const result = await sectionService.getSections(req.query, req.user);
  sendPaginated(res, 'Sections retrieved successfully', result.sections, result.pagination);
});

export const getSectionById = asyncHandler(async (req, res) => {
  const section = await sectionService.getSectionById(req.params.id, req.user);
  sendSuccess(res, 200, 'Section retrieved successfully', section);
});

export const updateSection = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const section = await sectionService.updateSection(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Section updated successfully', section);
});

export const deleteSection = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await sectionService.deleteSection(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});
