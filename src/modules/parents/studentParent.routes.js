import { Router } from 'express';
import * as studentParentController from './studentParent.controller.js';
import {
  validateCreateStudentParent,
  validateUpdateStudentParent,
  validateQueryStudentParents,
} from './studentParent.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /student-parent-links:
 *   post:
 *     tags: [Student Parent Links]
 *     summary: Link student to parent
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateStudentParent,
  studentParentController.createStudentParentLink
);

/**
 * @swagger
 * /student-parent-links:
 *   get:
 *     tags: [Student Parent Links]
 *     summary: List student-parent links with filters
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_READ),
  validateQueryStudentParents,
  studentParentController.getStudentParentLinks
);

/**
 * @swagger
 * /student-parent-links/{id}:
 *   patch:
 *     tags: [Student Parent Links]
 *     summary: Update student-parent link
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateStudentParent,
  studentParentController.updateStudentParentLink
);

/**
 * @swagger
 * /student-parent-links/{id}:
 *   delete:
 *     tags: [Student Parent Links]
 *     summary: Remove student-parent link
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_DELETE),
  studentParentController.deleteStudentParentLink
);

export default router;
