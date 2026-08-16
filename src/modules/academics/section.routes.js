import { Router } from 'express';
import * as sectionController from './section.controller.js';
import {
  validateCreateSection,
  validateUpdateSection,
  validateQuerySections,
} from './section.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /sections:
 *   post:
 *     tags: [Sections]
 *     summary: Create a new section
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.SECTIONS_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateSection,
  sectionController.createSection
);

/**
 * @swagger
 * /sections:
 *   get:
 *     tags: [Sections]
 *     summary: List sections with pagination and filters
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.SECTIONS_READ),
  validateQuerySections,
  sectionController.getSections
);

/**
 * @swagger
 * /sections/{id}:
 *   get:
 *     tags: [Sections]
 *     summary: Get section by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.SECTIONS_READ),
  sectionController.getSectionById
);

/**
 * @swagger
 * /sections/{id}:
 *   patch:
 *     tags: [Sections]
 *     summary: Update section
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.SECTIONS_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateSection,
  sectionController.updateSection
);

/**
 * @swagger
 * /sections/{id}:
 *   delete:
 *     tags: [Sections]
 *     summary: Soft delete section
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.SECTIONS_DELETE),
  sectionController.deleteSection
);

export default router;
