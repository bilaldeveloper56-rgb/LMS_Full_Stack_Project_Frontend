import AppError from '../utils/AppError.js';
import { ROLES, DEFAULT_ROLE_PERMISSIONS } from '../constants/index.js';

/**
 * Permission-based authorization middleware factory.
 * Checks if the authenticated user possesses ALL required permissions.
 *
 * Permission resolution order:
 *   1. SUPER_ADMIN bypasses all permission checks (implicit full access).
 *   2. Default role permissions from DEFAULT_ROLE_PERMISSIONS[user.role].
 *   3. Custom per-user permissions from user.permissions[] (additive merge).
 *
 * Usage:
 *   router.get('/fees', authenticate, requirePermission('fees:read'), controller)
 *   router.post('/fees', authenticate, requirePermission('fees:create', 'fees:manage'), controller)
 *
 * @param  {...string} requiredPermissions - Permission strings the user must possess
 * @returns {Function} Express middleware
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    // 1. Must be authenticated
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    // 2. SUPER_ADMIN has implicit full access — bypass all checks
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    // 3. Resolve effective permissions
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[req.user.role] || [];
    const customPermissions = req.user.permissions || [];
    const effectivePermissions = new Set([...rolePermissions, ...customPermissions]);

    // 4. Check that ALL required permissions are present
    const missing = requiredPermissions.filter((p) => !effectivePermissions.has(p));

    if (missing.length > 0) {
      return next(
        AppError.forbidden(
          `Missing required permission(s): ${missing.join(', ')}`
        )
      );
    }

    next();
  };
};

export default requirePermission;
