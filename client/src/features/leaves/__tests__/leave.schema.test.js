import { describe, it, expect } from 'vitest';
import { leaveApplicationSchema, leaveRejectionSchema } from '../schemas/leave.schema';

describe('Leave Schemas Validation', () => {
  it('should validate valid leave application', () => {
    const valid = {
      leaveType: 'SICK',
      dayType: 'FULL_DAY',
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      reason: 'Suffering from high fever',
    };
    expect(leaveApplicationSchema.safeParse(valid).success).toBe(true);
  });

  it('should reject when startDate is after endDate', () => {
    const invalid = {
      leaveType: 'SICK',
      dayType: 'FULL_DAY',
      startDate: '2026-09-05',
      endDate: '2026-09-01',
      reason: 'Suffering from high fever',
    };
    expect(leaveApplicationSchema.safeParse(invalid).success).toBe(false);
  });

  it('should enforce rejection reason constraints', () => {
    expect(leaveRejectionSchema.safeParse({ rejectionReason: 'Not approved' }).success).toBe(true);
    expect(leaveRejectionSchema.safeParse({ rejectionReason: 'no' }).success).toBe(false);
  });
});
