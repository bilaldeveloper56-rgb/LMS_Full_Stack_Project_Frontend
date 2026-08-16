import { Router } from 'express';
import * as studentController from './student.controller.js';
import { getStudentParents } from '../parents/studentParent.controller.js';
import { getStudentEnrollments } from './enrollment.controller.js';
import {
  validateCreateStudent,
  validateUpdateStudent,
  validateQueryStudents,
} from './student.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /students:
 *   post:
 *     tags: [Students]
 *     summary: Register a new student
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateStudent,
  studentController.createStudent
);

/**
 * @swagger
 * /students:
 *   get:
 *     tags: [Students]
 *     summary: List students with pagination, search, and filters
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_READ),
  validateQueryStudents,
  studentController.getStudents
);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Get student by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_READ),
  studentController.getStudentById
);

/**
 * @swagger
 * /students/{id}/profile:
 *   get:
 *     tags: [Students]
 *     summary: Get comprehensive student profile including linked parents
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/profile',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_READ),
  studentController.getStudentProfile
);

/**
 * @swagger
 * /students/{id}/academic:
 *   get:
 *     tags: [Students]
 *     summary: Get student academic record and current subject assignments
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/academic',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_READ),
  studentController.getStudentAcademic
);

/**
 * @swagger
 * /students/{id}/parents:
 *   get:
 *     tags: [Students]
 *     summary: Get linked parents/guardians for a student
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/parents',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_READ),
  getStudentParents
);

/**
 * @swagger
 * /students/{id}/enrollments:
 *   get:
 *     tags: [Students]
 *     summary: Get historical session enrollments for a student
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/enrollments',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_READ),
  getStudentEnrollments
);

/**
 * @swagger
 * /students/{id}:
 *   patch:
 *     tags: [Students]
 *     summary: Update student record
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateStudent,
  studentController.updateStudent
);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     tags: [Students]
 *     summary: Soft delete student record
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.STUDENTS_DELETE),
  studentController.deleteStudent
);

export default router;
