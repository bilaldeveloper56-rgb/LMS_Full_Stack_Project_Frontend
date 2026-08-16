import AuditLog from './auditLog.model.js';
import { logger } from '../../config/logger.js';

/**
 * Log an audit event to both database and structured logger.
 * Designed to not throw fatal errors if logging to DB fails,
 * ensuring core business flows are not blocked.
 *
 * @param {Object} params
 * @param {string} params.event - Event constant from AUTH_EVENTS
 * @param {string|mongoose.Types.ObjectId} [params.userId] - Performing user ID
 * @param {string|mongoose.Types.ObjectId} [params.schoolId] - Associated school ID
 * @param {string} [params.entityType] - Target entity type (e.g. 'School', 'User')
 * @param {string|mongoose.Types.ObjectId} [params.entityId] - Target entity ID
 * @param {Object} [params.details] - Metadata details object
 * @param {string} [params.ipAddress] - Request IP
 * @param {string} [params.userAgent] - Request User-Agent
 * @returns {Promise<AuditLog|null>}
 */
export async function logAuditEvent({
  event,
  userId = null,
  schoolId = null,
  entityType = null,
  entityId = null,
  details = {},
  ipAddress = null,
  userAgent = null,
}) {
  // 1. Structured log output
  logger.info(`[AUDIT] ${event}`, {
    event,
    userId,
    schoolId,
    entityType,
    entityId,
    details,
  });

  // 2. Persist to MongoDB only if connected or mocked
  if (AuditLog.db?.readyState === 1 || AuditLog.create?.isMock) {
    try {
      const log = await AuditLog.create({
        event,
        userId,
        schoolId,
        entityType,
        entityId,
        details,
        ipAddress,
        userAgent,
      });

      return log;
    } catch (error) {
      logger.error('Failed to write audit log to database:', error.message);
      return null;
    }
  }

  return null;
}

/**
 * Query and filter audit trail logs with tenant isolation and pagination.
 *
 * @param {Object} user - Authenticated user context
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>}
 */
export async function queryAuditLogs(user, filters = {}) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const query = {};

  // Tenant scoping: Non-Super Admin users are strictly constrained to their own school
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  if (!isSuperAdmin) {
    if (!user?.schoolId) {
      return {
        logs: [],
        pagination: { page, limit, total: 0, totalPages: 1 },
      };
    }
    query.schoolId = user.schoolId;
  } else if (filters.schoolId) {
    query.schoolId = filters.schoolId;
  }

  if (filters.userId) {
    query.userId = filters.userId;
  }

  const eventFilter = filters.event || filters.action;
  if (eventFilter) {
    query.event = eventFilter;
  }

  if (filters.entityType) {
    query.entityType = filters.entityType;
  }

  if (filters.entityId) {
    query.entityId = filters.entityId;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

