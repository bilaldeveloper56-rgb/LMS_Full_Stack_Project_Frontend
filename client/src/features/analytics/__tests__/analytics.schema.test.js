import { describe, it, expect } from 'vitest';
import { schoolAnalyticsFilterSchema } from '../schemas/analytics.schema';

describe('Analytics Zod Schema', () => {
  it('should validate partial and empty filter schemas', () => {
    expect(schoolAnalyticsFilterSchema.safeParse({}).success).toBe(true);
    expect(
      schoolAnalyticsFilterSchema.safeParse({
        academicSessionId: 'sess1',
        classId: 'c1',
        startDate: '2026-01-01',
        endDate: '2026-06-30',
      }).success
    ).toBe(true);
  });
});
