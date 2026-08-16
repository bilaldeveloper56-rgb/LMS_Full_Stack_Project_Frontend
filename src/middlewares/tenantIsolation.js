import AppError from '../utils/AppError.js';
import { ROLES } from '../constants/index.js';

/**
 * Tenant isolation middleware.
 * Injects req.tenantId from the authenticated user's schoolId.
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

  req.tenantId = req.user.schoolId;

  // Override any client-supplied schoolId to prevent cross-tenant injection
  if (req.body && typeof req.body === 'object') {
    req.body.schoolId = req.user.schoolId;
  }
  if (req.query && typeof req.query === 'object') {
    req.query.schoolId = req.user.schoolId;
  }

  next();
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
