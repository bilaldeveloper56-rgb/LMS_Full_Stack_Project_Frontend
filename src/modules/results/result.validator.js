import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

const gradeEntrySchema = z.object({
  grade: z.string().trim().min(1, 'Grade is required'),
  minPercentage: z.coerce.number().min(0).max(100),
  maxPercentage: z.coerce.number().min(0).max(100),
  gradePoint: z.coerce.number().min(0),
  description: z.string().trim().optional().default(''),
}).refine(
  (data) => data.minPercentage <= data.maxPercentage,
  {
    message: 'Min percentage must be less than or equal to max percentage',
    path: ['minPercentage'],
  }
);

export const createGradingScaleSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  isDefault: z.boolean().optional().default(false),
  grades: z.array(gradeEntrySchema).min(1, 'At least one grade entry is required'),
});

export const updateGradingScaleSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  isDefault: z.boolean().optional(),
  grades: z.array(gradeEntrySchema).min(1).optional(),
});

export const recordMarksSchema = z.object({
  examId: objectIdSchema,
  examPaperId: objectIdSchema,
  studentId: objectIdSchema,
  marksObtained: z.coerce.number().min(0, 'Marks cannot be negative'),
  remarks: z.string().trim().max(1000).optional().default(''),
});

export const bulkRecordMarksSchema = z.object({
  examId: objectIdSchema,
  examPaperId: objectIdSchema,
  records: z.array(
    z.object({
      studentId: objectIdSchema,
      marksObtained: z.coerce.number().min(0),
      remarks: z.string().trim().max(1000).optional().default(''),
    })
  ).min(1, 'At least one student record is required'),
});

export const queryResultSchema = z.object({
  academicSessionId: objectIdSchema.optional(),
  examId: objectIdSchema.optional(),
  examPaperId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
  studentId: objectIdSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
