import asyncHandler from '../../utils/asyncHandler.js';
import { sendPaginated } from '../../utils/responseHelper.js';
import * as auditService from './audit.service.js';
import { queryAuditLogsSchema } from './audit.validator.js';

/**
 * Get queryable and filterable audit trail logs.
 * GET /api/v1/audit-logs
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const validated = queryAuditLogsSchema.parse(req.query);
  const { logs, pagination } = await auditService.queryAuditLogs(req.user, validated);
  return sendPaginated(res, 'Audit logs retrieved successfully', logs, pagination);
});
