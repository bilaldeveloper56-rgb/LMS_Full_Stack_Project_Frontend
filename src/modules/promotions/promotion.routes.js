import { Router } from 'express';
import * as promotionController from './promotion.controller.js';
import {
  validateGetPromotionPreview,
  validateBulkPromote,
  validateQueryPromotionHistory,
} from './promotion.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

// Require authentication for all promotion routes
router.use(authenticate);

/**
 * @swagger
 * /promotions/preview:
 *   post:
 *     tags: [Promotions]
 *     summary: Calculate promotion preview and capacity warnings for candidate students
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/preview',
  enforceTenant,
  requirePermission(PERMISSIONS.PROMOTIONS_READ),
  sanitizeBody(...PROTECTED_FIELDS),
  validateGetPromotionPreview,
  promotionController.getPromotionPreview
);

/**
 * @swagger
 * /promotions/bulk:
 *   post:
 *     tags: [Promotions]
 *     summary: Execute atomic bulk promotion of students to destination session
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/bulk',
  enforceTenant,
  requirePermission(PERMISSIONS.PROMOTIONS_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateBulkPromote,
  promotionController.executeBulkPromotion
);

/**
 * @swagger
 * /promotions/history:
 *   get:
 *     tags: [Promotions]
 *     summary: Get paginated promotion audit history
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/history',
  enforceTenant,
  requirePermission(PERMISSIONS.PROMOTIONS_READ),
  validateQueryPromotionHistory,
  promotionController.getPromotionHistory
);

export default router;
