import * as schoolService from './school.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import { HTTP_STATUS } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';
import { extractTenantSlugFromReq, extractSlugFromHostname } from '../../middlewares/tenantIsolation.js';

/**
 * Public endpoint to fetch public tenant configuration (name, slug, logo, status)
 * based on the incoming hostname or tenant context.
 */
export const getCurrentTenant = asyncHandler(async (req, res) => {
  let slug = extractTenantSlugFromReq(req);

  // If not found from direct request host (e.g. cross-origin request to api.lmsprime.online from school.lmsprime.online)
  if (!slug) {
    if (typeof req.query?.slug === 'string' && req.query.slug.trim()) {
      slug = req.query.slug.trim().toLowerCase();
    } else if (typeof req.headers?.['x-tenant-subdomain'] === 'string' && req.headers['x-tenant-subdomain'].trim()) {
      slug = req.headers['x-tenant-subdomain'].trim().toLowerCase();
    } else if (req.headers?.origin || req.headers?.referer) {
      try {
        const originUrl = new URL(req.headers.origin || req.headers.referer);
        slug = extractSlugFromHostname(originUrl.hostname);
      } catch {
        // Ignore malformed origin/referer URL
      }
    }
  }

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
