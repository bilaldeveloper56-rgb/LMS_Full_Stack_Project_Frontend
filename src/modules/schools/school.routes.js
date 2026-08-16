import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as schoolController from './school.controller.js';
import {
  validateCreateSchool,
  validateUpdateSchool,
  validateChangeStatus,
  validateAcceptInvitation,
  validateQuerySchools,
} from './school.validator.js';
import authenticate from '../../middlewares/authenticate.js';
import authorize from '../../middlewares/authorize.js';
import requirePermission from '../../middlewares/requirePermission.js';
import { ROLES, PERMISSIONS } from '../../constants/index.js';

const router = Router();

const invitationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many invitation attempts. Please try again later.',
    errors: [],
  },
});

/**
 * @swagger
 * /schools/accept-invitation:
 *   post:
 *     tags: [Schools]
 *     summary: Complete School Admin account setup with invitation token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password, confirmPassword]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account activated successfully
 *       400:
 *         description: Invalid or expired invitation token
 */
router.post(
  '/accept-invitation',
  invitationLimiter,
  validateAcceptInvitation,
  schoolController.acceptInvitation
);

/**
 * @swagger
 * /schools:
 *   post:
 *     tags: [Schools]
 *     summary: Provision a new school with initial administrator (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [school, admin]
 *             properties:
 *               school:
 *                 type: object
 *                 required: [name, schoolCode, email]
 *                 properties:
 *                   name:
 *                     type: string
 *                   schoolCode:
 *                     type: string
 *                   email:
 *                     type: string
 *               admin:
 *                 type: object
 *                 required: [firstName, lastName, email]
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *     responses:
 *       201:
 *         description: School provisioned successfully
 *       403:
 *         description: Forbidden - SUPER_ADMIN only
 */
router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.SCHOOLS_CREATE),
  validateCreateSchool,
  schoolController.createSchool
);

/**
 * @swagger
 * /schools:
 *   get:
 *     tags: [Schools]
 *     summary: List, search, filter, and paginate schools (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of schools with pagination
 */
router.get(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.SCHOOLS_READ),
  validateQuerySchools,
  schoolController.getSchools
);

/**
 * @swagger
 * /schools/stats:
 *   get:
 *     tags: [Schools]
 *     summary: Get overall statistics of all schools (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: School statistics
 */
router.get(
  '/stats',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.SCHOOLS_MANAGE),
  schoolController.getSchoolStats
);

/**
 * @swagger
 * /schools/my-school:
 *   get:
 *     tags: [Schools]
 *     summary: Get current authenticated user's school profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's school profile
 *       400:
 *         description: User does not belong to a school
 */
router.get(
  '/my-school',
  authenticate,
  schoolController.getMySchool
);

/**
 * @swagger
 * /schools/{id}:
 *   get:
 *     tags: [Schools]
 *     summary: Get school details by ID (SUPER_ADMIN or School Members)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School details
 *       403:
 *         description: Forbidden - Cannot access other school data
 */
router.get(
  '/:id',
  authenticate,
  schoolController.getSchoolById
);

/**
 * @swagger
 * /schools/{id}:
 *   patch:
 *     tags: [Schools]
 *     summary: Update school profile information (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School updated successfully
 */
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.SCHOOLS_UPDATE),
  validateUpdateSchool,
  schoolController.updateSchool
);

/**
 * @swagger
 * /schools/{id}/status:
 *   patch:
 *     tags: [Schools]
 *     summary: Change school lifecycle status (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: School status changed
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.SCHOOLS_MANAGE),
  validateChangeStatus,
  schoolController.changeSchoolStatus
);

/**
 * @swagger
 * /schools/{id}/resend-admin-invitation:
 *   post:
 *     tags: [Schools]
 *     summary: Resend invitation email to initial School Admin (SUPER_ADMIN only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invitation resent
 */
router.post(
  '/:id/resend-admin-invitation',
  authenticate,
  authorize(ROLES.SUPER_ADMIN),
  requirePermission(PERMISSIONS.SCHOOLS_MANAGE),
  schoolController.resendAdminInvitation
);

export default router;
