/**
 * Field-level authorization middleware factory.
 * Strips specified fields from req.body before the handler executes.
 * Prevents mass-assignment of protected fields (role, schoolId, permissions, etc.).
 *
 * Usage:
 *   router.patch('/me', authenticate, sanitizeBody('role', 'schoolId', 'permissions'), controller)
 *   router.patch('/me', authenticate, sanitizeBody(...PROTECTED_FIELDS), controller)
 *
 * @param  {...string} protectedFields - Field names to strip from req.body
 * @returns {Function} Express middleware
 */
const sanitizeBody = (...protectedFields) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      for (const field of protectedFields) {
        delete req.body[field];
      }
    }
    next();
  };
};

export default sanitizeBody;
