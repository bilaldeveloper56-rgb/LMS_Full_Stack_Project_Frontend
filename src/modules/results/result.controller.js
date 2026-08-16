import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import * as resultService from './result.service.js';
import {
  createGradingScaleSchema,
  recordMarksSchema,
  bulkRecordMarksSchema,
} from './result.validator.js';

export const createGradingScale = asyncHandler(async (req, res) => {
  const validated = createGradingScaleSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const scale = await resultService.createGradingScale(validated, req.user, meta);
  return sendSuccess(res, 201, 'Grading scale created successfully', { scale });
});

export const getGradingScales = asyncHandler(async (req, res) => {
  const scales = await resultService.getGradingScales(req.user);
  return sendSuccess(res, 200, 'Grading scales retrieved successfully', { scales });
});

export const recordMarks = asyncHandler(async (req, res) => {
  const validated = recordMarksSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await resultService.recordStudentMarks(validated, req.user, meta);
  return sendSuccess(res, 201, 'Marks recorded successfully', { result });
});

export const bulkRecordMarks = asyncHandler(async (req, res) => {
  const validated = bulkRecordMarksSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const results = await resultService.bulkRecordMarks(validated, req.user, meta);
  return sendSuccess(res, 201, 'Marks bulk recorded successfully', { results });
});

export const lockSectionResults = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await resultService.lockSectionResults(req.params.examId, req.params.sectionId, req.user, meta);
  return sendSuccess(res, 200, result.message);
});

export const unlockSectionResults = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await resultService.unlockSectionResults(req.params.examId, req.params.sectionId, req.user, meta);
  return sendSuccess(res, 200, result.message);
});

export const publishSectionResults = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await resultService.publishSectionResults(req.params.examId, req.params.sectionId, req.user, meta);
  return sendSuccess(res, 200, result.message);
});

export const getStudentReportCard = asyncHandler(async (req, res) => {
  const reportCard = await resultService.getStudentReportCard(req.params.studentId, req.query.examId, req.user);
  return sendSuccess(res, 200, 'Student report card retrieved successfully', reportCard);
});

export const getSectionResults = asyncHandler(async (req, res) => {
  const results = await resultService.getSectionResults(req.params.examId, req.params.sectionId, req.user);
  return sendSuccess(res, 200, 'Section results retrieved successfully', { results });
});
