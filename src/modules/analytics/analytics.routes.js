import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { PERMISSIONS, ROLES } from '../../constants/index.js';
import * as analyticsController from './analytics.controller.js';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/analytics/school
 * @desc    Get institutional and academic dashboard analytics
 * @access  Private (Users with REPORTS_READ permission, scoped to own school)
 */
router.get(
  '/school',
  requirePermission(PERMISSIONS.REPORTS_READ),
  analyticsController.getSchoolAnalytics
);

/**
 * @route   GET /api/v1/analytics/platform
 * @desc    Get platform-wide multi-tenant analytics
 * @access  Private (Super Admin only)
 */
router.get(
  '/platform',
  authorize(ROLES.SUPER_ADMIN),
  analyticsController.getPlatformAnalytics
);

export default router;
