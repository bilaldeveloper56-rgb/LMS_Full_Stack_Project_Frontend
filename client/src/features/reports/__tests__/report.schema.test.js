import { describe, it, expect } from 'vitest';
import {
  studentRosterFilterSchema,
  attendanceReportFilterSchema,
  feeDefaultersFilterSchema,
  academicReportCardFilterSchema,
} from '../schemas/report.schema';

describe('Reports Zod Schemas', () => {
  it('should validate studentRosterFilterSchema', () => {
    expect(studentRosterFilterSchema.safeParse({}).success).toBe(true);
    expect(
      studentRosterFilterSchema.safeParse({
        academicSessionId: 'sess1',
        enrollmentStatus: 'ACTIVE',
      }).success
    ).toBe(true);
  });

  it('should validate attendanceReportFilterSchema and feeDefaultersFilterSchema', () => {
    expect(attendanceReportFilterSchema.safeParse({ classId: 'cls1', startDate: '2026-01-01' }).success).toBe(true);
    expect(feeDefaultersFilterSchema.safeParse({ minBalance: 100 }).success).toBe(true);
  });

  it('should validate academicReportCardFilterSchema with studentId requirement', () => {
    expect(academicReportCardFilterSchema.safeParse({ studentId: 'st1' }).success).toBe(true);
    expect(academicReportCardFilterSchema.safeParse({ studentId: '' }).success).toBe(false);
  });
});
