import { z } from 'zod';
import { EMPLOYMENT_STATUS_VALUES, GENDER_VALUES } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTeacherSchema = z.object({
  employeeId: z
    .string({ required_error: 'Employee ID is required' })
    .trim()
    .min(1, 'Employee ID is required')
    .max(50),
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
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address format').toLowerCase().trim(),
  phone: z.string().trim().optional(),
  dateOfBirth: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date of birth' }).optional(),
  gender: z.enum(GENDER_VALUES).default('OTHER'),
  qualification: z.string().trim().max(100).optional(),
  specialization: z.string().trim().max(100).optional(),
  joiningDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid joining date' }).optional(),
  designation: z.string().trim().max(50).default('Teacher'),
  profileImage: z.string().url().optional().nullable(),
  employmentStatus: z.enum(EMPLOYMENT_STATUS_VALUES).default('ACTIVE'),
  userId: z.string().regex(objectIdRegex, 'Invalid user ID format').nullable().optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateTeacherSchema = z.object({
  employeeId: z.string().trim().min(1).max(50).optional(),
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  email: z.string().email('Invalid email address format').toLowerCase().trim().optional(),
  phone: z.string().trim().nullable().optional(),
  dateOfBirth: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date of birth' }).nullable().optional(),
  gender: z.enum(GENDER_VALUES).optional(),
  qualification: z.string().trim().max(100).nullable().optional(),
  specialization: z.string().trim().max(100).nullable().optional(),
  joiningDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid joining date' }).optional(),
  designation: z.string().trim().max(50).optional(),
  profileImage: z.string().url().nullable().optional(),
  employmentStatus: z.enum(EMPLOYMENT_STATUS_VALUES).optional(),
  userId: z.string().regex(objectIdRegex, 'Invalid user ID format').nullable().optional(),
});

export const queryTeachersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  employmentStatus: z.enum(EMPLOYMENT_STATUS_VALUES).optional(),
  designation: z.string().trim().optional(),
  gender: z.enum(GENDER_VALUES).optional(),
  search: z.string().trim().optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['firstName', 'lastName', 'employeeId', 'joiningDate', 'createdAt']).default('createdAt'),
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

export const validateCreateTeacher = createValidator(createTeacherSchema, 'body');
export const validateUpdateTeacher = createValidator(updateTeacherSchema, 'body');
export const validateQueryTeachers = createValidator(queryTeachersSchema, 'query');
