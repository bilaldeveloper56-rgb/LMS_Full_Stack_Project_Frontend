import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as publicTenantController from './publicTenant.controller.js';
import { validateSlugParam } from './school.validator.js';

const router = Router();

// Public tenant rate limiter
const publicTenantLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests to public tenant service. Please try again later.',
    errors: [],
  },
});

router.use(publicTenantLimiter);

/**
 * @swagger
 * /public/tenant/current:
 *   get:
 *     tags: [Public Tenant]
 *     summary: Retrieve public branding and status for the current subdomain school tenant
 *     responses:
 *       200:
 *         description: Safe public tenant configuration
 *       404:
 *         description: School not found or invalid subdomain
 */
router.get('/current', publicTenantController.getCurrentTenant);

/**
 * @swagger
 * /public/tenant/slug-availability/{slug}:
 *   get:
 *     tags: [Public Tenant]
 *     summary: Check if a school subdomain slug is available, reserved, invalid, or taken
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability status
 */
router.get('/slug-availability/:slug', validateSlugParam, publicTenantController.checkSlugAvailability);

export default router;
