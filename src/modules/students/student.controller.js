import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as studentService from './student.service.js';

export const createStudent = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const student = await studentService.createStudent(req.body, req.user, meta);
  sendCreated(res, 'Student created successfully', student);
});

export const getStudents = asyncHandler(async (req, res) => {
  const result = await studentService.getStudents(req.query, req.user);
  sendPaginated(res, 'Students retrieved successfully', result.students, result.pagination);
});

export const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id, req.user);
  sendSuccess(res, 200, 'Student retrieved successfully', student);
});

export const getStudentProfile = asyncHandler(async (req, res) => {
  const profile = await studentService.getStudentProfile(req.params.id, req.user);
  sendSuccess(res, 200, 'Student profile retrieved successfully', profile);
});

export const getStudentAcademic = asyncHandler(async (req, res) => {
  const academic = await studentService.getStudentAcademic(req.params.id, req.user);
  sendSuccess(res, 200, 'Student academic records retrieved successfully', academic);
});

export const updateStudent = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const student = await studentService.updateStudent(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Student updated successfully', student);
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await studentService.deleteStudent(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});
