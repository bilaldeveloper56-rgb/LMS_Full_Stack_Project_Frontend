import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { PERMISSIONS } from '../../constants/index.js';
import * as auditController from './audit.controller.js';

const router = Router();

// All audit routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/audit-logs
 * @desc    Get filtered audit trail logs
 * @access  Private (Users with AUDIT_LOGS_READ permission)
 */
router.get(
  '/',
  requirePermission(PERMISSIONS.AUDIT_LOGS_READ),
  auditController.getAuditLogs
);

export default router;
