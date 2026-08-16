import { z } from 'zod';
import { SUBJECT_TYPE_VALUES } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createSubjectSchema = z.object({
  name: z.string({ required_error: 'Subject name is required' }).trim().min(1, 'Subject name is required').max(100),
  code: z.string({ required_error: 'Subject code is required' }).trim().min(1, 'Subject code is required').max(50),
  description: z.string().trim().max(500).optional(),
  subjectType: z.enum(SUBJECT_TYPE_VALUES).default('CORE'),
  isOptional: z.boolean().default(false),
  isActive: z.boolean().default(true),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateSubjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  code: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  subjectType: z.enum(SUBJECT_TYPE_VALUES).optional(),
  isOptional: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const querySubjectsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  subjectType: z.enum(SUBJECT_TYPE_VALUES).optional(),
  isOptional: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().trim().optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['name', 'code', 'subjectType', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
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

export const validateCreateSubject = createValidator(createSubjectSchema, 'body');
export const validateUpdateSubject = createValidator(updateSubjectSchema, 'body');
export const validateQuerySubjects = createValidator(querySubjectsSchema, 'query');
