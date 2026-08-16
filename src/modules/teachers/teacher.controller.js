import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as teacherService from './teacher.service.js';

export const createTeacher = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const teacher = await teacherService.createTeacher(req.body, req.user, meta);
  sendCreated(res, 'Teacher created successfully', teacher);
});

export const getTeachers = asyncHandler(async (req, res) => {
  const result = await teacherService.getTeachers(req.query, req.user);
  sendPaginated(res, 'Teachers retrieved successfully', result.teachers, result.pagination);
});

export const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getTeacherById(req.params.id, req.user);
  sendSuccess(res, 200, 'Teacher retrieved successfully', teacher);
});

export const updateTeacher = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const teacher = await teacherService.updateTeacher(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Teacher updated successfully', teacher);
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await teacherService.deleteTeacher(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});
