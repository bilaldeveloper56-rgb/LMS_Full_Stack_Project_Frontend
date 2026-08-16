import { Router } from 'express';
import * as classController from './class.controller.js';
import {
  validateCreateClass,
  validateUpdateClass,
  validateQueryClasses,
} from './class.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /classes:
 *   post:
 *     tags: [Classes]
 *     summary: Create a new class
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.CLASSES_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateClass,
  classController.createClass
);

/**
 * @swagger
 * /classes:
 *   get:
 *     tags: [Classes]
 *     summary: List classes with pagination, session filter, and search
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.CLASSES_READ),
  validateQueryClasses,
  classController.getClasses
);

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     tags: [Classes]
 *     summary: Get class by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.CLASSES_READ),
  classController.getClassById
);

/**
 * @swagger
 * /classes/{id}:
 *   patch:
 *     tags: [Classes]
 *     summary: Update class
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.CLASSES_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateClass,
  classController.updateClass
);

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     tags: [Classes]
 *     summary: Soft delete class
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.CLASSES_DELETE),
  classController.deleteClass
);

export default router;
