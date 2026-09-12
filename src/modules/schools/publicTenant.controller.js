import * as schoolService from './school.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import { HTTP_STATUS } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';
import { extractTenantSlugFromReq } from '../../middlewares/tenantIsolation.js';

/**
 * Public endpoint to fetch public tenant configuration (name, slug, logo, status)
 * based on the incoming hostname or tenant context.
 */
export const getCurrentTenant = asyncHandler(async (req, res) => {
  const slug = extractTenantSlugFromReq(req);

  if (!slug) {
    const error = AppError.notFound('School not found');
    error.code = 'TENANT_NOT_FOUND';
    throw error;
  }

  const tenantConfig = await schoolService.getPublicTenantConfigBySlug(slug);
  sendSuccess(res, HTTP_STATUS.OK, 'Tenant configuration retrieved successfully', tenantConfig);
});

/**
 * Public endpoint to check whether a school subdomain slug is available, reserved, invalid, or taken.
 * Safe to expose publicly — does NOT return any school's private information.
 */
export const checkSlugAvailability = asyncHandler(async (req, res) => {
  const slug = req.params.slug || req.validatedParams?.slug;
  const result = await schoolService.checkSlugAvailability(slug);
  sendSuccess(res, HTTP_STATUS.OK, 'Slug availability checked', result);
});
