import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import * as timetableService from './timetable.service.js';
import {
  createTimetableSchema,
  updateTimetableSchema,
  queryTimetableSchema,
} from './timetable.validator.js';

export const createTimetableEntry = asyncHandler(async (req, res) => {
  const validated = createTimetableSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const entry = await timetableService.createTimetableEntry(validated, req.user, meta);
  return sendSuccess(res, 201, 'Timetable entry created successfully', { entry });
});

export const getTimetableList = asyncHandler(async (req, res) => {
  const validated = queryTimetableSchema.parse(req.query);
  const result = await timetableService.getTimetableList(validated, req.user);
  return sendSuccess(res, 200, 'Timetable retrieved successfully', result);
});

export const getSectionTimetable = asyncHandler(async (req, res) => {
  const result = await timetableService.getSectionTimetable(req.params.sectionId, req.user);
  return sendSuccess(res, 200, 'Section timetable retrieved successfully', { timetable: result });
});

export const getTeacherTimetable = asyncHandler(async (req, res) => {
  const result = await timetableService.getTeacherTimetable(req.params.teacherId, req.user);
  return sendSuccess(res, 200, 'Teacher timetable retrieved successfully', { timetable: result });
});

export const updateTimetableEntry = asyncHandler(async (req, res) => {
  const validated = updateTimetableSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const entry = await timetableService.updateTimetableEntry(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 200, 'Timetable entry updated successfully', { entry });
});

export const deleteTimetableEntry = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await timetableService.deleteTimetableEntry(req.params.id, req.user, meta);
  return sendSuccess(res, 200, result.message);
});
