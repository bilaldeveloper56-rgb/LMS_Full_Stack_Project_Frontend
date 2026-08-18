import { z } from 'zod';
import { PROMOTION_STATUS_VALUES } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const getPromotionPreviewSchema = z
  .object({
    sourceAcademicSessionId: z
      .string({ required_error: 'Source academic session ID is required' })
      .regex(objectIdRegex, 'Invalid source academic session ID format'),
    destinationAcademicSessionId: z
      .string({ required_error: 'Destination academic session ID is required' })
      .regex(objectIdRegex, 'Invalid destination academic session ID format'),
    sourceClassId: z
      .string({ required_error: 'Source class ID is required' })
      .regex(objectIdRegex, 'Invalid source class ID format'),
    sourceSectionId: z
      .string({ required_error: 'Source section ID is required' })
      .regex(objectIdRegex, 'Invalid source section ID format'),
    destinationClassId: z
      .string()
      .regex(objectIdRegex, 'Invalid destination class ID format')
      .optional()
      .nullable()
      .transform((v) => (v === '' ? null : v)),
    destinationSectionId: z
      .string()
      .regex(objectIdRegex, 'Invalid destination section ID format')
      .optional()
      .nullable()
      .transform((v) => (v === '' ? null : v)),
    schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  })
  .refine(
    (data) => data.sourceAcademicSessionId !== data.destinationAcademicSessionId,
    {
      message: 'Source and destination academic sessions must be different',
      path: ['destinationAcademicSessionId'],
    }
  );

export const singleStudentPromotionItemSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(objectIdRegex, 'Invalid student ID format'),
  promotionStatus: z
    .enum(PROMOTION_STATUS_VALUES, { errorMap: () => ({ message: 'Invalid promotion status' }) })
    .default('PROMOTED'),
  targetClassId: z
    .string()
    .regex(objectIdRegex, 'Invalid target class ID format')
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  targetSectionId: z
    .string()
    .regex(objectIdRegex, 'Invalid target section ID format')
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  newRollNumber: z.string().trim().max(50).optional().nullable(),
  reason: z.string().trim().max(500).optional().nullable(),
});

export const bulkPromoteSchema = z
  .object({
    sourceAcademicSessionId: z
      .string({ required_error: 'Source academic session ID is required' })
      .regex(objectIdRegex, 'Invalid source academic session ID format'),
    destinationAcademicSessionId: z
      .string({ required_error: 'Destination academic session ID is required' })
      .regex(objectIdRegex, 'Invalid destination academic session ID format'),
    sourceClassId: z
      .string({ required_error: 'Source class ID is required' })
      .regex(objectIdRegex, 'Invalid source class ID format'),
    sourceSectionId: z
      .string({ required_error: 'Source section ID is required' })
      .regex(objectIdRegex, 'Invalid source section ID format'),
    destinationClassId: z
      .string()
      .regex(objectIdRegex, 'Invalid destination class ID format')
      .optional()
      .nullable()
      .transform((v) => (v === '' ? null : v)),
    destinationSectionId: z
      .string()
      .regex(objectIdRegex, 'Invalid destination section ID format')
      .optional()
      .nullable()
      .transform((v) => (v === '' ? null : v)),
    allowCapacityOverride: z.boolean().default(false),
    promotions: z
      .array(singleStudentPromotionItemSchema)
      .min(1, 'At least one student must be selected for promotion'),
    schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  })
  .refine(
    (data) => data.sourceAcademicSessionId !== data.destinationAcademicSessionId,
    {
      message: 'Source and destination academic sessions must be different',
      path: ['destinationAcademicSessionId'],
    }
  );

export const queryPromotionHistorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  studentId: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
  fromAcademicSessionId: z.string().regex(objectIdRegex, 'Invalid source session ID format').optional(),
  toAcademicSessionId: z.string().regex(objectIdRegex, 'Invalid destination session ID format').optional(),
  fromClassId: z.string().regex(objectIdRegex, 'Invalid source class ID format').optional(),
  toClassId: z.string().regex(objectIdRegex, 'Invalid destination class ID format').optional(),
  promotionStatus: z.enum(PROMOTION_STATUS_VALUES).optional(),
  batchId: z.string().trim().optional(),
  search: z.string().trim().optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['performedAt', 'createdAt']).default('performedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

function createValidator(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return next(AppError.validationError('Validation failed', errors));
      }
      next(error);
    }
  };
}

export const validateGetPromotionPreview = createValidator(getPromotionPreviewSchema, 'body');
export const validateBulkPromote = createValidator(bulkPromoteSchema, 'body');
export const validateQueryPromotionHistory = createValidator(queryPromotionHistorySchema, 'query');
