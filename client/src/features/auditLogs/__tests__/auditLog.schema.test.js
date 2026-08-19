import { describe, it, expect } from 'vitest';
import { auditLogFilterSchema } from '../schemas/auditLog.schema';

describe('Audit Logs Zod Schema', () => {
  it('should validate empty or partial auditLogFilterSchema', () => {
    expect(auditLogFilterSchema.safeParse({}).success).toBe(true);
    expect(
      auditLogFilterSchema.safeParse({
        event: 'AUTH_LOGIN_SUCCESS',
        entityType: 'User',
        page: 1,
        limit: 20,
      }).success
    ).toBe(true);
  });
});
