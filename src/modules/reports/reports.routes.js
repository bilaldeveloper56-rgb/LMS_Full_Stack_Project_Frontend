import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { PERMISSIONS } from '../../constants/index.js';
import * as reportsController from './reports.controller.js';

const router = Router();

// All reports routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/reports/student-roster
 * @desc    Get filtered student roster
 * @access  Private (REPORTS_READ)
 */
router.get(
  '/student-roster',
  requirePermission(PERMISSIONS.REPORTS_READ),
  reportsController.getStudentRoster
);

/**
 * @route   GET /api/v1/reports/attendance
 * @desc    Get attendance register summary
 * @access  Private (REPORTS_READ)
 */
router.get(
  '/attendance',
  requirePermission(PERMISSIONS.REPORTS_READ),
  reportsController.getAttendanceReport
);

/**
 * @route   GET /api/v1/reports/fee-defaulters
 * @desc    Get fee defaulters report
 * @access  Private (REPORTS_READ)
 */
router.get(
  '/fee-defaulters',
  requirePermission(PERMISSIONS.REPORTS_READ),
  reportsController.getFeeDefaulters
);

/**
 * @route   GET /api/v1/reports/report-card
 * @desc    Generate student academic report card
 * @access  Private (REPORTS_READ)
 */
router.get(
  '/report-card',
  requirePermission(PERMISSIONS.REPORTS_READ),
  reportsController.getAcademicReportCard
);

export default router;
