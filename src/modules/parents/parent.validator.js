import { z } from 'zod';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createParentSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .trim()
    .min(1, 'First name is required')
    .max(50),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .trim()
    .min(1, 'Last name is required')
    .max(50),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email format').toLowerCase().trim(),
  phone: z.string({ required_error: 'Phone number is required' }).trim().min(1, 'Phone is required'),
  alternatePhone: z.string().trim().optional().nullable().transform((val) => (val === '' ? null : val)),
  address: z.string().trim().max(200).optional().nullable().transform((val) => (val === '' ? null : val)),
  occupation: z.string().trim().max(100).optional().nullable().transform((val) => (val === '' ? null : val)),
  relationship: z.string().trim().max(50).optional().nullable().transform((val) => (val === '' ? null : val)),
  userId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => !val || objectIdRegex.test(val), { message: 'Invalid user ID format' }),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateParentSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  email: z.string().email('Invalid email format').toLowerCase().trim().optional(),
  phone: z.string().trim().optional(),
  alternatePhone: z.string().trim().nullable().optional().transform((val) => (val === '' ? null : val)),
  address: z.string().trim().max(200).nullable().optional().transform((val) => (val === '' ? null : val)),
  occupation: z.string().trim().max(100).nullable().optional().transform((val) => (val === '' ? null : val)),
  relationship: z.string().trim().max(50).nullable().optional().transform((val) => (val === '' ? null : val)),
  userId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val === '' ? null : val))
    .refine((val) => !val || objectIdRegex.test(val), { message: 'Invalid user ID format' }),
});

export const queryParentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['firstName', 'lastName', 'createdAt']).default('createdAt'),
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

export const validateCreateParent = createValidator(createParentSchema, 'body');
export const validateUpdateParent = createValidator(updateParentSchema, 'body');
export const validateQueryParents = createValidator(queryParentsSchema, 'query');
