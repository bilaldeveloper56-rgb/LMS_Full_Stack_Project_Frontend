import { z } from 'zod';
import { ENROLLMENT_STATUS_VALUES } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createEnrollmentSchema = z.object({
  studentId: z
    .string({ required_error: 'Student ID is required' })
    .regex(objectIdRegex, 'Invalid student ID format'),
  academicSessionId: z
    .string({ required_error: 'Academic session ID is required' })
    .regex(objectIdRegex, 'Invalid academic session ID format'),
  classId: z
    .string({ required_error: 'Class ID is required' })
    .regex(objectIdRegex, 'Invalid class ID format'),
  sectionId: z
    .string({ required_error: 'Section ID is required' })
    .regex(objectIdRegex, 'Invalid section ID format'),
  rollNumber: z.string().trim().max(50).nullable().optional(),
  enrollmentStatus: z.enum(ENROLLMENT_STATUS_VALUES).default('ACTIVE'),
  enrolledAt: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid enrolled date' }).optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateEnrollmentSchema = z.object({
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  sectionId: z.string().regex(objectIdRegex, 'Invalid section ID format').optional(),
  rollNumber: z.string().trim().max(50).nullable().optional(),
  enrollmentStatus: z.enum(ENROLLMENT_STATUS_VALUES).optional(),
  leftAt: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid left date' }).nullable().optional(),
});

export const queryEnrollmentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  studentId: z.string().regex(objectIdRegex, 'Invalid student ID format').optional(),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format').optional(),
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  sectionId: z.string().regex(objectIdRegex, 'Invalid section ID format').optional(),
  enrollmentStatus: z.enum(ENROLLMENT_STATUS_VALUES).optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
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

export const validateCreateEnrollment = createValidator(createEnrollmentSchema, 'body');
export const validateUpdateEnrollment = createValidator(updateEnrollmentSchema, 'body');
export const validateQueryEnrollments = createValidator(queryEnrollmentsSchema, 'query');
