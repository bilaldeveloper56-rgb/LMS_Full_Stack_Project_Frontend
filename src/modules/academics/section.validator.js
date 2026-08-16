import { z } from 'zod';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createSectionSchema = z.object({
  name: z.string({ required_error: 'Section name is required' }).trim().min(1, 'Section name is required').max(100),
  code: z.string({ required_error: 'Section code is required' }).trim().min(1, 'Section code is required').max(50),
  classId: z.string({ required_error: 'Class ID is required' }).regex(objectIdRegex, 'Invalid class ID format'),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format').optional(),
  capacity: z.coerce.number().int().positive('Capacity must be a positive number').default(40),
  room: z.string().trim().max(50).optional(),
  classTeacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID format').nullable().optional(),
  isActive: z.boolean().default(true),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateSectionSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  code: z.string().trim().min(1).max(50).optional(),
  capacity: z.coerce.number().int().positive('Capacity must be a positive number').optional(),
  room: z.string().trim().max(50).nullable().optional(),
  classTeacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID format').nullable().optional(),
  isActive: z.boolean().optional(),
});

export const querySectionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format').optional(),
  classTeacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID format').optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().trim().optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['name', 'code', 'capacity', 'createdAt']).default('name'),
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

export const validateCreateSection = createValidator(createSectionSchema, 'body');
export const validateUpdateSection = createValidator(updateSectionSchema, 'body');
export const validateQuerySections = createValidator(querySectionsSchema, 'query');
