import AppError from '../utils/AppError.js';
import { ROLES, SLUG_REGEX, isReservedSubdomain } from '../constants/index.js';
import School from '../modules/schools/school.model.js';
import { env } from '../config/env.js';

/**
 * Extract a candidate school slug from an incoming hostname string.
 *
 * @param {string} hostname - E.g. 'bright-future.lmsprime.online', 'bright-future.localhost'
 * @returns {string|null} - Subdomain slug or null if platform host/reserved
 */
export const extractSlugFromHostname = (hostname) => {
  if (!hostname || typeof hostname !== 'string') return null;
  const clean = hostname.toLowerCase().trim();

  // If matches *.lmsprime.online
  const prodMatch = clean.match(/^([a-z0-9-]+)\.lmsprime\.online$/);
  if (prodMatch) {
    const candidate = prodMatch[1];
    if (isReservedSubdomain(candidate)) return null;
    if (SLUG_REGEX.test(candidate)) return candidate;
    return null;
  }

  // If in dev, matches *.localhost
  const devMatch = clean.match(/^([a-z0-9-]+)\.localhost$/);
  if (devMatch) {
    const candidate = devMatch[1];
    if (isReservedSubdomain(candidate)) return null;
    if (SLUG_REGEX.test(candidate)) return candidate;
    return null;
  }

  return null;
};

/**
 * Safely extract the authoritative request hostname from an Express request or mock.
 *
 * Security Rules:
 * 1. If the verified HTTP Host header explicitly matches *.lmsprime.online, it is
 *    authoritative and takes absolute precedence. Untrusted client forwarding headers
 *    (such as X-Forwarded-Host) CANNOT override an established *.lmsprime.online Host.
 * 2. If in development and Host matches *.localhost, Host is authoritative.
 * 3. If Host is absent or is an internal proxy/hosting domain (e.g. *.onrender.com),
 *    the leftmost entry of X-Forwarded-Host (forwarded by trusted edge proxy) is inspected.
 * 4. Express req.hostname is evaluated if present.
 * 5. General Host header fallback (e.g. localhost, 127.0.0.1).
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export const extractHostnameFromReq = (req) => {
  if (!req) return null;

  const rawHostHeader = req.headers?.host;
  const hostHeader = typeof rawHostHeader === 'string'
    ? rawHostHeader.split(':')[0].toLowerCase().trim()
    : null;

  // 1. Authoritative: If HTTP Host header is on *.lmsprime.online, it represents the
  // verified destination matched by TLS SNI and DNS. Untrusted forwarding headers cannot override it.
  if (hostHeader && hostHeader.endsWith('.lmsprime.online')) {
    return hostHeader;
  }

  // 2. Development: If Host header is on *.localhost
  if (hostHeader && hostHeader.endsWith('.localhost')) {
    return hostHeader;
  }

  // 3. Fallback for reverse proxy setups where Host was rewritten to an internal origin
  // (e.g. *.onrender.com), or where Host was omitted in unit test mocks
  const forwardedHost = req.headers?.['x-forwarded-host'];
  if (forwardedHost && typeof forwardedHost === 'string') {
    const firstHost = forwardedHost.split(',')[0].trim();
    const cleanForwarded = firstHost.split(':')[0].toLowerCase().trim();
    if (cleanForwarded) {
      return cleanForwarded;
    }
  }

  // 4. Express req.hostname (evaluated safely by Express when trust proxy is configured)
  if (typeof req.hostname === 'string' && req.hostname) {
    return req.hostname.toLowerCase().trim();
  }

  // 5. Host header fallback (e.g. localhost, 127.0.0.1)
  if (hostHeader) {
    return hostHeader;
  }

  return null;
};

/**
 * Authoritatively extract the tenant subdomain from an Express request.
 *
 * Production Security Rules:
 * - The tenant identity is resolved EXCLUSIVELY from the trusted server-side request hostname.
 * - Origin and Referer headers MUST NOT be used for tenant selection.
 * - Client-supplied X-Tenant-Subdomain header MUST NOT override or select tenant in production.
 *
 * Development Fallback Rules (NODE_ENV !== 'production'):
 * - If hostname is localhost / 127.0.0.1 or undefined (test mock), controlled fallback
 *   to query param (?tenant=slug) or X-Tenant-Subdomain is allowed for local testing.
 *
 * @param {import('express').Request} req
 * @returns {string|null} Tenant slug or null
 */
export const extractTenantSlugFromReq = (req) => {
  if (!req) return null;

  const hostname = extractHostnameFromReq(req);

  // 1. Authoritative: resolve slug from trusted request hostname
  if (hostname) {
    const slugFromHost = extractSlugFromHostname(hostname);
    if (slugFromHost) {
      return slugFromHost;
    }
  }

  // 2. Development/Test Fallback ONLY (NODE_ENV !== 'production')
  // Permitted only when accessing via localhost / 127.0.0.1 or test mock without hostname
  const isDevOrTest = !env.NODE_ENV || env.NODE_ENV !== 'production';
  const isLocalHost = !hostname || hostname === 'localhost' || hostname === '127.0.0.1';

  if (isDevOrTest && isLocalHost) {
    // 2a. Query parameter fallback: ?tenant=bright-future
    const queryTenant = req.query?.tenant;
    if (queryTenant && typeof queryTenant === 'string') {
      const candidate = queryTenant.trim().toLowerCase();
      if (SLUG_REGEX.test(candidate) && !isReservedSubdomain(candidate)) {
        return candidate;
      }
    }

    // 2b. Development header fallback: X-Tenant-Subdomain
    const customHeader = req.headers?.['x-tenant-subdomain'];
    if (customHeader && typeof customHeader === 'string') {
      const candidate = customHeader.trim().toLowerCase();
      if (SLUG_REGEX.test(candidate) && !isReservedSubdomain(candidate)) {
        return candidate;
      }
    }
  }

  return null;
};

/**
 * Tenant isolation middleware.
 * Injects req.tenantId from the authenticated user's schoolId.
 * Cross-references against subdomain tenant context if request arrived via school subdomain.
 * Strips/overrides any client-supplied schoolId from req.body and req.query.
 * SUPER_ADMIN is exempt from tenant enforcement (platform-level access).
 *
 * Usage:
 *   router.post('/students', authenticate, enforceTenant, controller)
 */
export const enforceTenant = (req, res, next) => {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required'));
  }

  // SUPER_ADMIN operates at platform level — no tenant scoping
  if (req.user.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  // School-level users: inject tenant context
  if (!req.user.schoolId) {
    return next(AppError.forbidden('User is not associated with any school'));
  }

  // Check if request arrived on a school subdomain
  const subdomainSlug = extractTenantSlugFromReq(req);
  if (!subdomainSlug) {
    req.tenantId = req.user.schoolId;

    // Override any client-supplied schoolId to prevent cross-tenant injection
    if (req.body && typeof req.body === 'object') {
      req.body.schoolId = req.user.schoolId;
    }
    if (req.query && typeof req.query === 'object') {
      req.query.schoolId = req.user.schoolId;
    }

    return next();
  }

  // Subdomain tenant context present: resolve and enforce cross-tenant boundaries
  School.findOne({ slug: subdomainSlug, isDeleted: false })
    .then((tenantSchool) => {
      if (!tenantSchool) {
        const err = AppError.notFound('School not found');
        err.code = 'TENANT_NOT_FOUND';
        return next(err);
      }

      // Cross-Tenant Boundary Check:
      // The authenticated user's schoolId must match the subdomain's school ID!
      if (req.user.schoolId !== tenantSchool._id.toString()) {
        return next(
          AppError.forbidden('You do not have access to this school\'s resources')
        );
      }

      req.tenantId = req.user.schoolId;
      req.subdomainTenant = tenantSchool;

      // Override any client-supplied schoolId to prevent cross-tenant injection
      if (req.body && typeof req.body === 'object') {
        req.body.schoolId = req.user.schoolId;
      }
      if (req.query && typeof req.query === 'object') {
        req.query.schoolId = req.user.schoolId;
      }

      next();
    })
    .catch(next);
};

/**
 * Middleware factory to validate that a route parameter matches the user's school.
 * SUPER_ADMIN can access any school.
 *
 * @param {string} [paramName='schoolId'] - Route parameter containing the school ID
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.get('/schools/:schoolId/students', authenticate, requireSchoolMembership('schoolId'), controller)
 */
export const requireSchoolMembership = (paramName = 'schoolId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    // SUPER_ADMIN can access any school
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const targetSchoolId = req.params[paramName];

    if (!targetSchoolId) {
      return next(AppError.badRequest(`Missing route parameter: ${paramName}`));
    }

    if (req.user.schoolId !== targetSchoolId) {
      return next(
        AppError.forbidden('You do not have access to this school\'s resources')
      );
    }

    next();
  };
};

/**
 * Build a MongoDB query scoped to the user's school.
 * For SUPER_ADMIN, returns the base query unchanged (platform-wide access).
 * For school-level users, adds schoolId filter.
 *
 * @param {Object} req - Express request (must have req.user)
 * @param {Object} [baseQuery={}] - Base MongoDB query to extend
 * @returns {Object} Tenant-scoped query
 *
 * Usage:
 *   const query = buildTenantQuery(req, { status: 'ACTIVE' });
 *   const students = await Student.find(query);
 */
export const buildTenantQuery = (req, baseQuery = {}) => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }

  // SUPER_ADMIN: no tenant scoping
  if (req.user.role === ROLES.SUPER_ADMIN) {
    return { ...baseQuery };
  }

  // School-level users: scope to their school
  return {
    ...baseQuery,
    schoolId: req.user.schoolId,
  };
};
