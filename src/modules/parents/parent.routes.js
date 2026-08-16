import { Router } from 'express';
import * as parentController from './parent.controller.js';
import {
  validateCreateParent,
  validateUpdateParent,
  validateQueryParents,
} from './parent.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /parents:
 *   post:
 *     tags: [Parents]
 *     summary: Create a new parent record
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateParent,
  parentController.createParent
);

/**
 * @swagger
 * /parents:
 *   get:
 *     tags: [Parents]
 *     summary: List parents with pagination and search
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_READ),
  validateQueryParents,
  parentController.getParents
);

/**
 * @swagger
 * /parents/{id}:
 *   get:
 *     tags: [Parents]
 *     summary: Get parent by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_READ),
  parentController.getParentById
);

/**
 * @swagger
 * /parents/{id}/children:
 *   get:
 *     tags: [Parents]
 *     summary: Get all linked children for a parent
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/children',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_READ),
  parentController.getParentChildren
);

/**
 * @swagger
 * /parents/{id}:
 *   patch:
 *     tags: [Parents]
 *     summary: Update parent record
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateParent,
  parentController.updateParent
);

/**
 * @swagger
 * /parents/{id}:
 *   delete:
 *     tags: [Parents]
 *     summary: Soft delete parent
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.PARENTS_DELETE),
  parentController.deleteParent
);

export default router;
