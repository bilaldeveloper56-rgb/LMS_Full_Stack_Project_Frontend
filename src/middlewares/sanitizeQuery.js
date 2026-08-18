/**
 * Middleware that sanitizes query parameters by stripping empty strings.
 *
 * In web browsers and REST clients, unselected filter dropdowns or empty search boxes
 * typically send empty strings (e.g. ?status=&search=&classId=).
 * Express parses these into { status: '', search: '', classId: '' }.
 *
 * Deleting empty string keys allows Zod validation schemas with '.optional()'
 * to treat omitted/empty query filters as undefined, preventing 422 Unprocessable Entity
 * validation failures on enums, ObjectIds, and dates.
 */
export const sanitizeQuery = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string' && req.query[key].trim() === '') {
        delete req.query[key];
      }
    }
  }
  next();
};

export default sanitizeQuery;
