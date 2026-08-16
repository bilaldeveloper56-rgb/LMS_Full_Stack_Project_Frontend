import { Router } from 'express';
import * as teacherController from './teacher.controller.js';
import {
  validateCreateTeacher,
  validateUpdateTeacher,
  validateQueryTeachers,
} from './teacher.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /teachers:
 *   post:
 *     tags: [Teachers]
 *     summary: Create a new teacher record
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateTeacher,
  teacherController.createTeacher
);

/**
 * @swagger
 * /teachers:
 *   get:
 *     tags: [Teachers]
 *     summary: List teachers with pagination and search
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_READ),
  validateQueryTeachers,
  teacherController.getTeachers
);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     tags: [Teachers]
 *     summary: Get teacher by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_READ),
  teacherController.getTeacherById
);

/**
 * @swagger
 * /teachers/{id}:
 *   patch:
 *     tags: [Teachers]
 *     summary: Update teacher record
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateTeacher,
  teacherController.updateTeacher
);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     tags: [Teachers]
 *     summary: Soft delete teacher
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.TEACHERS_DELETE),
  teacherController.deleteTeacher
);

export default router;
