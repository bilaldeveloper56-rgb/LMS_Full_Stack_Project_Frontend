import { Router } from 'express';
import * as enrollmentController from './enrollment.controller.js';
import {
  validateCreateEnrollment,
  validateUpdateEnrollment,
  validateQueryEnrollments,
} from './enrollment.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /enrollments:
 *   post:
 *     tags: [Enrollments]
 *     summary: Enroll student into class and section for an academic session
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_MANAGE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateEnrollment,
  enrollmentController.createEnrollment
);

/**
 * @swagger
 * /enrollments:
 *   get:
 *     tags: [Enrollments]
 *     summary: List enrollments with filters
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_READ),
  validateQueryEnrollments,
  enrollmentController.getEnrollments
);

/**
 * @swagger
 * /enrollments/{id}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get enrollment record by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_READ),
  enrollmentController.getEnrollmentById
);

/**
 * @swagger
 * /enrollments/{id}:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Update enrollment record
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_MANAGE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateEnrollment,
  enrollmentController.updateEnrollment
);

/**
 * @swagger
 * /enrollments/{id}:
 *   delete:
 *     tags: [Enrollments]
 *     summary: Delete enrollment record
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_MANAGE),
  enrollmentController.deleteEnrollment
);

export default router;
