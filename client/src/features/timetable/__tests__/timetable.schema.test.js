import { describe, it, expect } from 'vitest';
import { timetableSlotSchema } from '../schemas/timetable.schema';

describe('Timetable Schemas Validation', () => {
  it('should validate valid timetable slot', () => {
    const valid = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      subjectId: '507f1f77bcf86cd799439014',
      teacherId: '507f1f77bcf86cd799439015',
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      startTime: '08:00',
      endTime: '08:45',
      room: 'Room 101',
    };
    expect(timetableSlotSchema.safeParse(valid).success).toBe(true);
  });

  it('should reject when startTime is after or equal to endTime', () => {
    const invalid = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439012',
      sectionId: '507f1f77bcf86cd799439013',
      subjectId: '507f1f77bcf86cd799439014',
      teacherId: '507f1f77bcf86cd799439015',
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      startTime: '09:00',
      endTime: '08:45',
    };
    expect(timetableSlotSchema.safeParse(invalid).success).toBe(false);
  });
});
