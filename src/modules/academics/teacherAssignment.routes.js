import { Router } from 'express';
import * as assignmentController from './teacherAssignment.controller.js';
import {
  validateCreateTeacherAssignment,
  validateUpdateTeacherAssignment,
  validateQueryTeacherAssignments,
} from './teacherAssignment.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /teacher-assignments:
 *   post:
 *     tags: [Teacher Assignments]
 *     summary: Assign teacher to subject, class, and section
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_MANAGE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateTeacherAssignment,
  assignmentController.createTeacherAssignment
);

/**
 * @swagger
 * /teacher-assignments:
 *   get:
 *     tags: [Teacher Assignments]
 *     summary: List teacher assignments with filters
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_READ),
  validateQueryTeacherAssignments,
  assignmentController.getTeacherAssignments
);

/**
 * @swagger
 * /teacher-assignments/{id}:
 *   get:
 *     tags: [Teacher Assignments]
 *     summary: Get teacher assignment by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_READ),
  assignmentController.getTeacherAssignmentById
);

/**
 * @swagger
 * /teacher-assignments/{id}:
 *   patch:
 *     tags: [Teacher Assignments]
 *     summary: Update teacher assignment
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_MANAGE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateTeacherAssignment,
  assignmentController.updateTeacherAssignment
);

/**
 * @swagger
 * /teacher-assignments/{id}:
 *   delete:
 *     tags: [Teacher Assignments]
 *     summary: Delete teacher assignment
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_MANAGE),
  assignmentController.deleteTeacherAssignment
);

export default router;
