import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as sessionService from './academicSession.service.js';

export const createAcademicSession = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const session = await sessionService.createAcademicSession(req.body, req.user, meta);
  sendCreated(res, 'Academic session created successfully', session);
});

export const getAcademicSessions = asyncHandler(async (req, res) => {
  const result = await sessionService.getAcademicSessions(req.query, req.user);
  sendPaginated(res, 'Academic sessions retrieved successfully', result.sessions, result.pagination);
});

export const getAcademicSessionById = asyncHandler(async (req, res) => {
  const session = await sessionService.getAcademicSessionById(req.params.id, req.user);
  sendSuccess(res, 200, 'Academic session retrieved successfully', session);
});

export const updateAcademicSession = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const session = await sessionService.updateAcademicSession(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Academic session updated successfully', session);
});

export const deleteAcademicSession = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await sessionService.deleteAcademicSession(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});

export const changeSessionStatus = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const session = await sessionService.changeSessionStatus(req.params.id, req.body.status, req.user, meta);
  sendSuccess(res, 200, 'Academic session status updated successfully', session);
});

export const setCurrentSession = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const session = await sessionService.setCurrentSession(req.params.id, req.user, meta);
  sendSuccess(res, 200, 'Academic session set as current active session', session);
});
