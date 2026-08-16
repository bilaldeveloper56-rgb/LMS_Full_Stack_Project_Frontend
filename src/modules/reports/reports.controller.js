import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginated } from '../../utils/responseHelper.js';
import * as reportsService from './reports.service.js';
import {
  studentRosterQuerySchema,
  attendanceReportQuerySchema,
  feeDefaultersQuerySchema,
  academicReportCardQuerySchema,
} from './reports.validator.js';
import AppError from '../../utils/AppError.js';

export const getStudentRoster = asyncHandler(async (req, res) => {
  const validated = studentRosterQuerySchema.parse(req.query);
  const targetSchoolId = req.user.schoolId || req.query.schoolId;

  if (!targetSchoolId) {
    throw AppError.badRequest('School ID is required');
  }

  const { roster, pagination } = await reportsService.getStudentRoster(targetSchoolId, validated);
  return sendPaginated(res, 'Student roster report retrieved successfully', roster, pagination);
});

export const getAttendanceReport = asyncHandler(async (req, res) => {
  const validated = attendanceReportQuerySchema.parse(req.query);
  const targetSchoolId = req.user.schoolId || req.query.schoolId;

  if (!targetSchoolId) {
    throw AppError.badRequest('School ID is required');
  }

  const { reports, pagination } = await reportsService.getAttendanceReport(targetSchoolId, validated);
  return sendPaginated(res, 'Attendance report retrieved successfully', reports, pagination);
});

export const getFeeDefaulters = asyncHandler(async (req, res) => {
  const validated = feeDefaultersQuerySchema.parse(req.query);
  const targetSchoolId = req.user.schoolId || req.query.schoolId;

  if (!targetSchoolId) {
    throw AppError.badRequest('School ID is required');
  }

  const { defaulters, pagination } = await reportsService.getFeeDefaultersReport(targetSchoolId, validated);
  return sendPaginated(res, 'Fee defaulters report retrieved successfully', defaulters, pagination);
});

export const getAcademicReportCard = asyncHandler(async (req, res) => {
  const validated = academicReportCardQuerySchema.parse(req.query);
  const targetSchoolId = req.user.schoolId || req.query.schoolId;

  if (!targetSchoolId) {
    throw AppError.badRequest('School ID is required');
  }

  const reportCard = await reportsService.getAcademicReportCard(
    targetSchoolId,
    validated.studentId,
    validated
  );
  return sendSuccess(res, 200, 'Academic report card generated successfully', reportCard);
});
