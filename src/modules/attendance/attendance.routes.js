import { Router } from 'express';
import * as attendanceController from './attendance.controller.js';
import {
  validateCreateAttendance,
  validateUpdateAttendance,
  validateCorrectAttendance,
  validateBulkAttendance,
  validateQueryAttendance,
  validateQueryAttendanceReport,
} from './attendance.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /attendance:
 *   post:
 *     tags: [Attendance]
 *     summary: Mark single student attendance
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateAttendance,
  attendanceController.createAttendance
);

/**
 * @swagger
 * /attendance/bulk:
 *   post:
 *     tags: [Attendance]
 *     summary: Bulk mark attendance for a class section
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/bulk',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateBulkAttendance,
  attendanceController.bulkMarkAttendance
);

/**
 * @swagger
 * /attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: List attendance records with pagination and filters
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  validateQueryAttendance,
  attendanceController.getAttendanceList
);

/**
 * @swagger
 * /attendance/reports/summary:
 *   get:
 *     tags: [Attendance]
 *     summary: Get overall attendance summary report
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/reports/summary',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_REPORT),
  validateQueryAttendanceReport,
  attendanceController.getAttendanceSummaryReport
);

/**
 * @swagger
 * /attendance/reports/student/{studentId}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get student attendance report summary
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/reports/student/:studentId',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_REPORT),
  validateQueryAttendanceReport,
  attendanceController.getStudentAttendanceReport
);

/**
 * @swagger
 * /attendance/reports/section/{sectionId}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get section attendance report summary
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/reports/section/:sectionId',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_REPORT),
  validateQueryAttendanceReport,
  attendanceController.getSectionAttendanceReport
);

/**
 * @swagger
 * /attendance/reports/class/{classId}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get class attendance report summary
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/reports/class/:classId',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_REPORT),
  validateQueryAttendanceReport,
  attendanceController.getClassAttendanceReport
);

/**
 * @swagger
 * /attendance/student/{studentId}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get full attendance history & statistics for a student
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/student/:studentId',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  validateQueryAttendance,
  attendanceController.getStudentAttendance
);

/**
 * @swagger
 * /attendance/section/{sectionId}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get section attendance records
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/section/:sectionId',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  validateQueryAttendance,
  attendanceController.getSectionAttendance
);

/**
 * @swagger
 * /attendance/class/{classId}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get class attendance records
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/class/:classId',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  validateQueryAttendance,
  attendanceController.getClassAttendance
);

/**
 * @swagger
 * /attendance/{id}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get attendance record by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_READ),
  attendanceController.getAttendanceById
);

/**
 * @swagger
 * /attendance/{id}:
 *   patch:
 *     tags: [Attendance]
 *     summary: Update attendance record
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateAttendance,
  attendanceController.updateAttendance
);

/**
 * @swagger
 * /attendance/{id}/correct:
 *   patch:
 *     tags: [Attendance]
 *     summary: Submit an official correction with reason for an attendance record
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/correct',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCorrectAttendance,
  attendanceController.correctAttendance
);

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     tags: [Attendance]
 *     summary: Soft delete an attendance record
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.ATTENDANCE_DELETE),
  attendanceController.deleteAttendance
);

export default router;
