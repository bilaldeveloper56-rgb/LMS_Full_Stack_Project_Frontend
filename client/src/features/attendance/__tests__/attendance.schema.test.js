import { describe, it, expect } from 'vitest';
import {
  singleAttendanceSchema,
  bulkAttendanceSchema,
  attendanceCorrectionSchema,
} from '../schemas/attendance.schema';

describe('Attendance Schemas Validation', () => {
  it('should validate single attendance record', () => {
    const valid = {
      studentId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      academicSessionId: '507f1f77bcf86cd799439014',
      date: '2026-09-01',
      status: 'PRESENT',
      remarks: 'On time',
    };
    expect(singleAttendanceSchema.safeParse(valid).success).toBe(true);
  });

  it('should validate bulk attendance schema', () => {
    const validBulk = {
      academicSessionId: '507f1f77bcf86cd799439014',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      date: '2026-09-01',
      records: [
        { studentId: '507f1f77bcf86cd799439011', status: 'PRESENT' },
        { studentId: '507f1f77bcf86cd799439015', status: 'ABSENT', remarks: 'Unwell' },
      ],
    };
    expect(bulkAttendanceSchema.safeParse(validBulk).success).toBe(true);
  });

  it('should enforce required correction reason on correction schema', () => {
    const valid = { status: 'EXCUSED', correctionReason: 'Medical certificate submitted' };
    expect(attendanceCorrectionSchema.safeParse(valid).success).toBe(true);

    const invalid = { status: 'EXCUSED', correctionReason: 'no' };
    expect(attendanceCorrectionSchema.safeParse(invalid).success).toBe(false);
  });
});
