import { z } from 'zod';
import AppError from '../../utils/AppError.js';
import { SCHOOL_STATUS_VALUES } from '../../constants/index.js';

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * @param {z.ZodSchema} schema
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    return next(AppError.validationError('Validation failed', errors));
  }
  req.validatedBody = result.data;
  next();
};

/**
 * Creates an Express middleware that validates req.query against a Zod schema.
 * @param {z.ZodSchema} schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    return next(AppError.validationError('Invalid query parameters', errors));
  }
  req.validatedQuery = result.data;
  next();
};

const createSchoolSchema = z.object({
  school: z.object({
    name: z
      .string({ required_error: 'School name is required' })
      .trim()
      .min(1, 'School name is required')
      .max(100, 'School name cannot exceed 100 characters'),
    schoolCode: z
      .string({ required_error: 'School code is required' })
      .trim()
      .toUpperCase()
      .min(2, 'School code must be at least 2 characters')
      .max(20, 'School code cannot exceed 20 characters')
      .regex(/^[A-Z0-9_-]+$/, 'School code can only contain letters, numbers, hyphens, and underscores'),
    email: z
      .string({ required_error: 'School email is required' })
      .email('Invalid school email format')
      .trim()
      .toLowerCase(),
    phone: z.string().trim().optional().nullable(),
    address: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    province: z.string().trim().optional().nullable(),
    country: z.string().trim().default('US'),
    logo: z.string().url('Invalid logo URL').optional().nullable(),
    website: z.string().url('Invalid website URL').optional().nullable(),
    registrationNumber: z.string().trim().optional().nullable(),
    timezone: z.string().default('UTC'),
    currency: z.string().default('USD'),
    language: z.string().default('en'),
  }),
  admin: z.object({
    firstName: z
      .string({ required_error: 'Admin first name is required' })
      .trim()
      .min(1, 'Admin first name is required')
      .max(50, 'Admin first name cannot exceed 50 characters'),
    lastName: z
      .string({ required_error: 'Admin last name is required' })
      .trim()
      .min(1, 'Admin last name is required')
      .max(50, 'Admin last name cannot exceed 50 characters'),
    email: z
      .string({ required_error: 'Admin email is required' })
      .email('Invalid admin email format')
      .trim()
      .toLowerCase(),
    phone: z.string().trim().optional().nullable(),
  }),
});

const updateSchoolSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email('Invalid email format').trim().toLowerCase().optional(),
  phone: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  province: z.string().trim().optional().nullable(),
  country: z.string().trim().optional(),
  logo: z.string().url('Invalid logo URL').optional().nullable(),
  website: z.string().url('Invalid website URL').optional().nullable(),
  registrationNumber: z.string().trim().optional().nullable(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
});

const changeStatusSchema = z.object({
  status: z.enum(SCHOOL_STATUS_VALUES, {
    errorMap: () => ({
      message: `Status must be one of: ${SCHOOL_STATUS_VALUES.join(', ')}`,
    }),
  }),
  reason: z.string().trim().optional(),
});

const acceptInvitationSchema = z
  .object({
    token: z
      .string({ required_error: 'Invitation token is required' })
      .min(1, 'Invitation token is required'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one digit'
      ),
    confirmPassword: z.string({
      required_error: 'Confirm password is required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const querySchoolsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(SCHOOL_STATUS_VALUES).optional(),
  sortBy: z.enum(['name', 'schoolCode', 'email', 'createdAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const validateCreateSchool = validateBody(createSchoolSchema);
export const validateUpdateSchool = validateBody(updateSchoolSchema);
export const validateChangeStatus = validateBody(changeStatusSchema);
export const validateAcceptInvitation = validateBody(acceptInvitationSchema);
export const validateQuerySchools = validateQuery(querySchoolsSchema);
