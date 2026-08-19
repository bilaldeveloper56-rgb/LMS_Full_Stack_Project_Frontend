import { describe, it, expect } from 'vitest';
import {
  createExamSchema,
  createExamPaperSchema,
} from '../schemas/exam.schema';

describe('Exam Zod Schemas', () => {
  it('should validate createExamSchema correctly', () => {
    const valid = {
      academicSessionId: '507f1f77bcf86cd799439011',
      name: 'Mid Term Examination',
      examType: 'MID_TERM',
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      description: 'Standard mid term exam',
    };
    expect(createExamSchema.safeParse(valid).success).toBe(true);

    const invalidDates = {
      ...valid,
      startDate: '2026-10-20',
      endDate: '2026-10-10', // End before start
    };
    expect(createExamSchema.safeParse(invalidDates).success).toBe(false);
  });

  it('should validate createExamPaperSchema correctly', () => {
    const validPaper = {
      classId: '507f1f77bcf86cd799439022',
      subjectId: '507f1f77bcf86cd799439033',
      date: '2026-10-05',
      startTime: '09:00',
      endTime: '12:00',
      totalMarks: 100,
      passingMarks: 40,
    };
    expect(createExamPaperSchema.safeParse(validPaper).success).toBe(true);

    const invalidMarks = {
      ...validPaper,
      passingMarks: 150, // Passing > Total
    };
    expect(createExamPaperSchema.safeParse(invalidMarks).success).toBe(false);

    const invalidTimes = {
      ...validPaper,
      startTime: '14:00',
      endTime: '10:00', // End before start
    };
    expect(createExamPaperSchema.safeParse(invalidTimes).success).toBe(false);
  });
});
