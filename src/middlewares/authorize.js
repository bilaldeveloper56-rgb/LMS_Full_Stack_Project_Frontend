import AppError from '../utils/AppError.js';

/**
 * Authorization middleware factory.
 * Checks if the authenticated user's role is in the allowed list.
 *
 * Usage:
 *   router.get('/admin', authenticate, authorize('SUPER_ADMIN', 'SCHOOL_ADMIN'), controller)
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

export default authorize;
