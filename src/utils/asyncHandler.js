/**
 * Wraps an async Express route handler to automatically catch
 * rejected promises and forward them to Express error middleware.
 * Eliminates try/catch boilerplate in controllers.
 *
 * @param {Function} fn - Async route handler (req, res, next)
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
