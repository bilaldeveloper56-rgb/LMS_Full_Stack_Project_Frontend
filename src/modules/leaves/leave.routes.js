import { Router } from 'express';
import * as leaveController from './leave.controller.js';
import {
  validateCreateLeave,
  validateUpdateLeave,
  validateRejectLeave,
  validateQueryLeaves,
} from './leave.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /leaves:
 *   post:
 *     tags: [Leaves]
 *     summary: Submit a leave request
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateLeave,
  leaveController.createLeave
);

/**
 * @swagger
 * /leaves:
 *   get:
 *     tags: [Leaves]
 *     summary: List leave requests with pagination and filters
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_READ),
  validateQueryLeaves,
  leaveController.listLeaves
);

/**
 * @swagger
 * /leaves/my:
 *   get:
 *     tags: [Leaves]
 *     summary: Get current authenticated user's leave requests
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/my',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_READ),
  validateQueryLeaves,
  leaveController.getMyLeaves
);

/**
 * @swagger
 * /leaves/student/{studentId}:
 *   get:
 *     tags: [Leaves]
 *     summary: Get leave requests for a specific student
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/student/:studentId',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_READ),
  validateQueryLeaves,
  leaveController.getStudentLeaves
);

/**
 * @swagger
 * /leaves/teacher/{teacherId}:
 *   get:
 *     tags: [Leaves]
 *     summary: Get leave requests for a specific teacher
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/teacher/:teacherId',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_READ),
  validateQueryLeaves,
  leaveController.getTeacherLeaves
);

/**
 * @swagger
 * /leaves/{id}:
 *   get:
 *     tags: [Leaves]
 *     summary: Get leave request by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_READ),
  leaveController.getLeaveById
);

/**
 * @swagger
 * /leaves/{id}:
 *   patch:
 *     tags: [Leaves]
 *     summary: Update pending leave request
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateLeave,
  leaveController.updateLeave
);

/**
 * @swagger
 * /leaves/{id}/cancel:
 *   post:
 *     tags: [Leaves]
 *     summary: Cancel pending leave request
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/cancel',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_UPDATE),
  leaveController.cancelLeave
);

/**
 * @swagger
 * /leaves/{id}/approve:
 *   post:
 *     tags: [Leaves]
 *     summary: Approve pending leave request
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/approve',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_APPROVE),
  leaveController.approveLeave
);

/**
 * @swagger
 * /leaves/{id}/reject:
 *   post:
 *     tags: [Leaves]
 *     summary: Reject pending leave request
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/reject',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_REJECT),
  validateRejectLeave,
  leaveController.rejectLeave
);

/**
 * @swagger
 * /leaves/{id}:
 *   delete:
 *     tags: [Leaves]
 *     summary: Soft delete leave request
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.LEAVES_DELETE),
  leaveController.deleteLeave
);

export default router;
