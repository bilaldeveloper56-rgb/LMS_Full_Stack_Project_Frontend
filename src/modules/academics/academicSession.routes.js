import { Router } from 'express';
import * as sessionController from './academicSession.controller.js';
import {
  validateCreateAcademicSession,
  validateUpdateAcademicSession,
  validateChangeSessionStatus,
  validateQueryAcademicSessions,
} from './academicSession.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';

const router = Router();

// Base middleware for all academic session routes
router.use(authenticate);

/**
 * @swagger
 * /academic-sessions:
 *   post:
 *     tags: [Academic Sessions]
 *     summary: Create a new academic session
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.ACADEMIC_SESSIONS_CREATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateCreateAcademicSession,
  sessionController.createAcademicSession
);

/**
 * @swagger
 * /academic-sessions:
 *   get:
 *     tags: [Academic Sessions]
 *     summary: List academic sessions with pagination, search, and status filter
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  enforceTenant,
  requirePermission(PERMISSIONS.ACADEMIC_SESSIONS_READ),
  validateQueryAcademicSessions,
  sessionController.getAcademicSessions
);

/**
 * @swagger
 * /academic-sessions/{id}:
 *   get:
 *     tags: [Academic Sessions]
 *     summary: Get academic session by ID
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.ACADEMIC_SESSIONS_READ),
  sessionController.getAcademicSessionById
);

/**
 * @swagger
 * /academic-sessions/{id}:
 *   patch:
 *     tags: [Academic Sessions]
 *     summary: Update academic session
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.ACADEMIC_SESSIONS_UPDATE),
  sanitizeBody(...PROTECTED_FIELDS),
  validateUpdateAcademicSession,
  sessionController.updateAcademicSession
);

/**
 * @swagger
 * /academic-sessions/{id}:
 *   delete:
 *     tags: [Academic Sessions]
 *     summary: Soft delete academic session
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/:id',
  enforceTenant,
  requirePermission(PERMISSIONS.ACADEMIC_SESSIONS_DELETE),
  sessionController.deleteAcademicSession
);

/**
 * @swagger
 * /academic-sessions/{id}/status:
 *   patch:
 *     tags: [Academic Sessions]
 *     summary: Change academic session status
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/status',
  enforceTenant,
  requirePermission(PERMISSIONS.ACADEMIC_SESSIONS_MANAGE),
  validateChangeSessionStatus,
  sessionController.changeSessionStatus
);

/**
 * @swagger
 * /academic-sessions/{id}/set-current:
 *   patch:
 *     tags: [Academic Sessions]
 *     summary: Mark academic session as current active session
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id/set-current',
  enforceTenant,
  requirePermission(PERMISSIONS.ACADEMIC_SESSIONS_MANAGE),
  sessionController.setCurrentSession
);

export default router;
