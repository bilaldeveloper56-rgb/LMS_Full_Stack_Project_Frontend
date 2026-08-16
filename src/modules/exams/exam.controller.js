import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import * as examService from './exam.service.js';
import {
  createExamSchema,
  updateExamSchema,
  createExamPaperSchema,
  queryExamSchema,
} from './exam.validator.js';

export const createExam = asyncHandler(async (req, res) => {
  const validated = createExamSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const exam = await examService.createExam(validated, req.user, meta);
  return sendSuccess(res, 201, 'Exam created successfully', { exam });
});

export const getExamsList = asyncHandler(async (req, res) => {
  const validated = queryExamSchema.parse(req.query);
  const result = await examService.getExamsList(validated, req.user);
  return sendSuccess(res, 200, 'Exams retrieved successfully', result);
});

export const getExamById = asyncHandler(async (req, res) => {
  const exam = await examService.getExamById(req.params.id, req.user);
  return sendSuccess(res, 200, 'Exam retrieved successfully', { exam });
});

export const updateExam = asyncHandler(async (req, res) => {
  const validated = updateExamSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const exam = await examService.updateExam(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 200, 'Exam updated successfully', { exam });
});

export const deleteExam = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await examService.deleteExam(req.params.id, req.user, meta);
  return sendSuccess(res, 200, result.message);
});

export const publishExam = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const exam = await examService.publishExam(req.params.id, req.user, meta);
  return sendSuccess(res, 200, 'Exam published successfully', { exam });
});

export const scheduleExamPaper = asyncHandler(async (req, res) => {
  const validated = createExamPaperSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const paper = await examService.scheduleExamPaper(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 201, 'Exam paper scheduled successfully', { paper });
});
