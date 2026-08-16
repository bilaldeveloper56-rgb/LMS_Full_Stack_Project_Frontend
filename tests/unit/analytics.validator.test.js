import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { schoolAnalyticsQuerySchema, platformAnalyticsQuerySchema } from '../../src/modules/analytics/analytics.validator.js';

describe('Analytics Validators Unit Tests', () => {
  it('should accept valid school analytics query', () => {
    const valid = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439022',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    };
    const result = schoolAnalyticsQuerySchema.parse(valid);
    assert.equal(result.academicSessionId, valid.academicSessionId);
  });

  it('should allow empty school analytics query', () => {
    const result = schoolAnalyticsQuerySchema.parse({});
    assert.deepEqual(result, {});
  });

  it('should accept valid platform analytics query', () => {
    const valid = {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    };
    const result = platformAnalyticsQuerySchema.parse(valid);
    assert.equal(result.startDate, valid.startDate);
  });
});
