import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import * as analyticsService from './analytics.service.js';
import { schoolAnalyticsQuerySchema, platformAnalyticsQuerySchema } from './analytics.validator.js';
import AppError from '../../utils/AppError.js';

/**
 * Get institutional/school analytics.
 * GET /api/v1/analytics/school
 */
export const getSchoolAnalytics = asyncHandler(async (req, res) => {
  const validated = schoolAnalyticsQuerySchema.parse(req.query);

  // School-level users must only access their own school. Super Admin can specify schoolId in query.
  const targetSchoolId = req.user.schoolId || req.query.schoolId;

  if (!targetSchoolId) {
    throw AppError.badRequest('School ID is required for school analytics');
  }

  const analytics = await analyticsService.getSchoolAnalytics(targetSchoolId, validated);
  return sendSuccess(res, 200, 'School analytics retrieved successfully', analytics);
});

/**
 * Get global platform-wide analytics for Super Admin.
 * GET /api/v1/analytics/platform
 */
export const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const validated = platformAnalyticsQuerySchema.parse(req.query);
  const analytics = await analyticsService.getPlatformAnalytics(validated);
  return sendSuccess(res, 200, 'Platform analytics retrieved successfully', analytics);
});
