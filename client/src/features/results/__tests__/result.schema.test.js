import { describe, it, expect } from 'vitest';
import {
  createGradingScaleSchema,
  recordMarksSchema,
  bulkRecordMarksSchema,
} from '../schemas/result.schema';

describe('Results Zod Schemas', () => {
  it('should validate createGradingScaleSchema correctly', () => {
    const valid = {
      name: 'Standard GPA',
      isDefault: true,
      grades: [
        { grade: 'A', minPercentage: 80, maxPercentage: 100, gradePoint: 4.0 },
        { grade: 'F', minPercentage: 0, maxPercentage: 79.99, gradePoint: 0.0 },
      ],
    };
    expect(createGradingScaleSchema.safeParse(valid).success).toBe(true);

    const invalidGrade = {
      name: 'Invalid Scale',
      grades: [
        { grade: 'A', minPercentage: 90, maxPercentage: 50, gradePoint: 4.0 }, // min > max
      ],
    };
    expect(createGradingScaleSchema.safeParse(invalidGrade).success).toBe(false);
  });

  it('should validate recordMarksSchema and bulkRecordMarksSchema', () => {
    const validSingle = {
      examId: '507f1f77bcf86cd799439011',
      examPaperId: '507f1f77bcf86cd799439022',
      studentId: '507f1f77bcf86cd799439033',
      marksObtained: 88,
    };
    expect(recordMarksSchema.safeParse(validSingle).success).toBe(true);

    const validBulk = {
      examId: '507f1f77bcf86cd799439011',
      examPaperId: '507f1f77bcf86cd799439022',
      records: [
        { studentId: '507f1f77bcf86cd799439033', marksObtained: 88 },
        { studentId: '507f1f77bcf86cd799439044', marksObtained: 92 },
      ],
    };
    expect(bulkRecordMarksSchema.safeParse(validBulk).success).toBe(true);

    const emptyBulk = {
      examId: '507f1f77bcf86cd799439011',
      examPaperId: '507f1f77bcf86cd799439022',
      records: [],
    };
    expect(bulkRecordMarksSchema.safeParse(emptyBulk).success).toBe(false);
  });
});
