import { z } from 'zod';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createClassSchema = z.object({
  name: z.string({ required_error: 'Class name is required' }).trim().min(1, 'Class name is required').max(100),
  code: z.string({ required_error: 'Class code is required' }).trim().min(1, 'Class code is required').max(50),
  academicSessionId: z
    .string({ required_error: 'Academic session ID is required' })
    .regex(objectIdRegex, 'Invalid academic session ID format'),
  description: z.string().trim().max(500).optional(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateClassSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  code: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  displayOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const queryClassesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format').optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().trim().optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['displayOrder', 'name', 'code', 'createdAt']).default('displayOrder'),
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

export const validateCreateClass = createValidator(createClassSchema, 'body');
export const validateUpdateClass = createValidator(updateClassSchema, 'body');
export const validateQueryClasses = createValidator(queryClassesSchema, 'query');
