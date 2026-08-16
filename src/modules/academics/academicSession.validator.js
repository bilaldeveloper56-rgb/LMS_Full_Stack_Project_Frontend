import { z } from 'zod';
import { SESSION_STATUS_VALUES } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createAcademicSessionSchema = z
  .object({
    name: z.string({ required_error: 'Session name is required' }).trim().min(1, 'Session name is required').max(100),
    startDate: z.string({ required_error: 'Start date is required' }).refine((d) => !isNaN(Date.parse(d)), {
      message: 'Invalid start date format',
    }),
    endDate: z.string({ required_error: 'End date is required' }).refine((d) => !isNaN(Date.parse(d)), {
      message: 'Invalid end date format',
    }),
    status: z.enum(SESSION_STATUS_VALUES, { errorMap: () => ({ message: 'Invalid session status' }) }).optional(),
    isCurrent: z.boolean().optional(),
    schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  })
  .refine(
    (data) => new Date(data.startDate) < new Date(data.endDate),
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  );

export const updateAcademicSessionSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    startDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }).optional(),
    endDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }).optional(),
    status: z.enum(SESSION_STATUS_VALUES).optional(),
    isCurrent: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  );

export const changeSessionStatusSchema = z.object({
  status: z.enum(SESSION_STATUS_VALUES, {
    errorMap: () => ({ message: 'Invalid session status' }),
  }),
});

export const queryAcademicSessionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(SESSION_STATUS_VALUES).optional(),
  isCurrent: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['name', 'startDate', 'endDate', 'status', 'createdAt']).default('createdAt'),
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

export const validateCreateAcademicSession = createValidator(createAcademicSessionSchema, 'body');
export const validateUpdateAcademicSession = createValidator(updateAcademicSessionSchema, 'body');
export const validateChangeSessionStatus = createValidator(changeSessionStatusSchema, 'body');
export const validateQueryAcademicSessions = createValidator(queryAcademicSessionsSchema, 'query');
