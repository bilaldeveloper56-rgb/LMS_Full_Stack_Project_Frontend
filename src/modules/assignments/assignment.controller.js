import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import * as assignmentService from './assignment.service.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  queryAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
} from './assignment.validator.js';

export const createAssignment = asyncHandler(async (req, res) => {
  const validated = createAssignmentSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const assignment = await assignmentService.createAssignment(validated, req.user, meta);
  return sendSuccess(res, 201, 'Assignment created successfully', { assignment });
});

export const getAssignmentsList = asyncHandler(async (req, res) => {
  const validated = queryAssignmentSchema.parse(req.query);
  const result = await assignmentService.getAssignmentsList(validated, req.user);
  return sendSuccess(res, 200, 'Assignments retrieved successfully', result);
});

export const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id, req.user);
  return sendSuccess(res, 200, 'Assignment retrieved successfully', { assignment });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const validated = updateAssignmentSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const assignment = await assignmentService.updateAssignment(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 200, 'Assignment updated successfully', { assignment });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await assignmentService.deleteAssignment(req.params.id, req.user, meta);
  return sendSuccess(res, 200, result.message);
});

export const publishAssignment = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const assignment = await assignmentService.publishAssignment(req.params.id, req.user, meta);
  return sendSuccess(res, 200, 'Assignment published successfully', { assignment });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const validated = submitAssignmentSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const submission = await assignmentService.submitAssignment(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 201, 'Assignment submitted successfully', { submission });
});

export const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const submissions = await assignmentService.getAssignmentSubmissions(req.params.id, req.user);
  return sendSuccess(res, 200, 'Submissions retrieved successfully', { submissions });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const validated = gradeSubmissionSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const submission = await assignmentService.gradeSubmission(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 200, 'Submission graded successfully', { submission });
});
