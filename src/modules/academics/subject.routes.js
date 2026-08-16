import { Router } from 'express';
import * as subjectController from './subject.controller.js';
import {
  validateCreateSubject,
  validateUpdateSubject,
  validateQuerySubjects,
} from './subject.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /subjects:
 *   post:
 *     tags: [Subjects]
 *     summary: Create a new subject
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.SUBJECTS_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateSubject,
  subjectController.createSubject
);

/**
 * @swagger
 * /subjects:
 *   get:
 *     tags: [Subjects]
 *     summary: List subjects with pagination and search
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.SUBJECTS_READ),
  validateQuerySubjects,
  subjectController.getSubjects
);

/**
 * @swagger
 * /subjects/{id}:
 *   get:
 *     tags: [Subjects]
 *     summary: Get subject by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.SUBJECTS_READ),
  subjectController.getSubjectById
);

/**
 * @swagger
 * /subjects/{id}:
 *   patch:
 *     tags: [Subjects]
 *     summary: Update subject
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.SUBJECTS_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateSubject,
  subjectController.updateSubject
);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     tags: [Subjects]
 *     summary: Soft delete subject
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.SUBJECTS_DELETE),
  subjectController.deleteSubject
);

export default router;
