import { z } from 'zod';

export const gradeEntrySchema = z
  .object({
    grade: z.string().trim().min(1, 'Grade label is required'),
    minPercentage: z.coerce.number().min(0, 'Min % cannot be negative').max(100, 'Max is 100'),
    maxPercentage: z.coerce.number().min(0, 'Min % cannot be negative').max(100, 'Max is 100'),
    gradePoint: z.coerce.number().min(0, 'Grade point cannot be negative'),
    description: z.string().trim().optional().default(''),
  })
  .refine(
    (data) => Number(data.minPercentage) <= Number(data.maxPercentage),
    {
      message: 'Min percentage must be <= Max percentage',
      path: ['minPercentage'],
    }
  );

export const createGradingScaleSchema = z.object({
  name: z.string().trim().min(1, 'Grading scale name is required').max(100),
  isDefault: z.boolean().default(false),
  grades: z.array(gradeEntrySchema).min(1, 'At least one grade boundary is required'),
});

export const recordMarksSchema = z.object({
  examId: z.string().min(1, 'Exam is required'),
  examPaperId: z.string().min(1, 'Exam Paper is required'),
  studentId: z.string().min(1, 'Student is required'),
  marksObtained: z.coerce.number().min(0, 'Marks cannot be negative'),
  remarks: z.string().trim().max(1000).optional().default(''),
});

export const bulkRecordMarksSchema = z.object({
  examId: z.string().min(1, 'Exam is required'),
  examPaperId: z.string().min(1, 'Exam Paper is required'),
  records: z
    .array(
      z.object({
        studentId: z.string().min(1, 'Student is required'),
        marksObtained: z.coerce.number().min(0, 'Marks cannot be negative'),
        remarks: z.string().trim().max(1000).optional().default(''),
      })
    )
    .min(1, 'At least one student record is required'),
});
