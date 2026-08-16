import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as subjectService from './subject.service.js';

export const createSubject = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const subject = await subjectService.createSubject(req.body, req.user, meta);
  sendCreated(res, 'Subject created successfully', subject);
});

export const getSubjects = asyncHandler(async (req, res) => {
  const result = await subjectService.getSubjects(req.query, req.user);
  sendPaginated(res, 'Subjects retrieved successfully', result.subjects, result.pagination);
});

export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await subjectService.getSubjectById(req.params.id, req.user);
  sendSuccess(res, 200, 'Subject retrieved successfully', subject);
});

export const updateSubject = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const subject = await subjectService.updateSubject(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Subject updated successfully', subject);
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await subjectService.deleteSubject(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});
