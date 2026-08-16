import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import * as quizService from './quiz.service.js';
import {
  createQuizSchema,
  updateQuizSchema,
  queryQuizSchema,
  submitQuizAttemptSchema,
  gradeQuizAttemptSchema,
} from './quiz.validator.js';

export const createQuiz = asyncHandler(async (req, res) => {
  const validated = createQuizSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const quiz = await quizService.createQuiz(validated, req.user, meta);
  return sendSuccess(res, 201, 'Quiz created successfully', { quiz });
});

export const getQuizzesList = asyncHandler(async (req, res) => {
  const validated = queryQuizSchema.parse(req.query);
  const result = await quizService.getQuizzesList(validated, req.user);
  return sendSuccess(res, 200, 'Quizzes retrieved successfully', result);
});

export const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuizById(req.params.id, req.user);
  return sendSuccess(res, 200, 'Quiz retrieved successfully', { quiz });
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const validated = updateQuizSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const quiz = await quizService.updateQuiz(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 200, 'Quiz updated successfully', { quiz });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await quizService.deleteQuiz(req.params.id, req.user, meta);
  return sendSuccess(res, 200, result.message);
});

export const publishQuiz = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const quiz = await quizService.publishQuiz(req.params.id, req.user, meta);
  return sendSuccess(res, 200, 'Quiz published successfully', { quiz });
});

export const startQuizAttempt = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const attempt = await quizService.startQuizAttempt(req.params.id, req.user, meta);
  return sendSuccess(res, 201, 'Quiz attempt started successfully', { attempt });
});

export const submitQuizAttempt = asyncHandler(async (req, res) => {
  const validated = submitQuizAttemptSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const attempt = await quizService.submitQuizAttempt(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 200, 'Quiz attempt submitted successfully', { attempt });
});

export const gradeQuizAttempt = asyncHandler(async (req, res) => {
  const validated = gradeQuizAttemptSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const attempt = await quizService.gradeQuizAttempt(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 200, 'Quiz attempt graded successfully', { attempt });
});
