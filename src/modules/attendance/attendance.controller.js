import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as attendanceService from './attendance.service.js';

export const createAttendance = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const attendance = await attendanceService.createAttendance(req.body, req.user, meta);
  sendCreated(res, 'Attendance marked successfully', attendance);
});

export const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await attendanceService.bulkMarkAttendance(req.body, req.user, meta);
  sendCreated(res, `Bulk attendance recorded for ${result.length} students successfully`, result);
});

export const getAttendanceList = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendanceList(req.query, req.user);
  sendPaginated(res, 'Attendance records retrieved successfully', result.records, result.pagination);
});

export const getAttendanceById = asyncHandler(async (req, res) => {
  const record = await attendanceService.getAttendanceById(req.params.id, req.user);
  sendSuccess(res, 200, 'Attendance record retrieved successfully', record);
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const record = await attendanceService.updateAttendance(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Attendance updated successfully', record);
});

export const correctAttendance = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const record = await attendanceService.correctAttendance(req.params.id, req.body, req.user, meta);
  sendSuccess(res, 200, 'Attendance correction recorded successfully', record);
});

export const deleteAttendance = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await attendanceService.deleteAttendance(req.params.id, req.user, meta);
  sendSuccess(res, 200, result.message);
});

export const getStudentAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getStudentAttendanceProfile(req.params.studentId, req.query, req.user);
  sendSuccess(res, 200, 'Student attendance profile retrieved successfully', result);
});

export const getSectionAttendance = asyncHandler(async (req, res) => {
  const query = { ...req.query, sectionId: req.params.sectionId };
  const result = await attendanceService.getAttendanceList(query, req.user);
  sendPaginated(res, 'Section attendance retrieved successfully', result.records, result.pagination);
});

export const getClassAttendance = asyncHandler(async (req, res) => {
  const query = { ...req.query, classId: req.params.classId };
  const result = await attendanceService.getAttendanceList(query, req.user);
  sendPaginated(res, 'Class attendance retrieved successfully', result.records, result.pagination);
});

export const getAttendanceSummaryReport = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendanceReportSummary(req.query, req.user);
  sendSuccess(res, 200, 'Attendance summary report generated successfully', result);
});

export const getStudentAttendanceReport = asyncHandler(async (req, res) => {
  const query = { ...req.query, studentId: req.params.studentId };
  const result = await attendanceService.getAttendanceReportSummary(query, req.user);
  sendSuccess(res, 200, 'Student attendance report generated successfully', result);
});

export const getSectionAttendanceReport = asyncHandler(async (req, res) => {
  const query = { ...req.query, sectionId: req.params.sectionId };
  const result = await attendanceService.getAttendanceReportSummary(query, req.user);
  sendSuccess(res, 200, 'Section attendance report generated successfully', result);
});

export const getClassAttendanceReport = asyncHandler(async (req, res) => {
  const query = { ...req.query, classId: req.params.classId };
  const result = await attendanceService.getAttendanceReportSummary(query, req.user);
  sendSuccess(res, 200, 'Class attendance report generated successfully', result);
});
