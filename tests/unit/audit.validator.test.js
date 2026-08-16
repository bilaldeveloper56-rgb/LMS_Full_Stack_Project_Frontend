import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { queryAuditLogsSchema } from '../../src/modules/audit/audit.validator.js';

describe('Audit Log Validator Unit Tests', () => {
  it('should accept valid audit log query filters with defaults', () => {
    const result = queryAuditLogsSchema.parse({});
    assert.equal(result.page, 1);
    assert.equal(result.limit, 50);
  });

  it('should accept filters with event, entityType, and date ranges', () => {
    const filters = {
      event: 'AUTH_LOGIN_SUCCESS',
      entityType: 'User',
      startDate: '2026-01-01',
      page: '3',
      limit: '20',
    };
    const result = queryAuditLogsSchema.parse(filters);
    assert.equal(result.event, 'AUTH_LOGIN_SUCCESS');
    assert.equal(result.entityType, 'User');
    assert.equal(result.page, 3);
    assert.equal(result.limit, 20);
  });
});
