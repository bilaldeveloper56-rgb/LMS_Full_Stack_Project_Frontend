import { z } from 'zod';
import AppError from '../../utils/AppError.js';

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * @param {z.ZodSchema} schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
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

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Current password is required' })
      .min(1, 'Current password is required'),
    newPassword: z
      .string({ required_error: 'New password is required' })
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
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
});

const resetPasswordSchema = z
  .object({
    token: z
      .string({ required_error: 'Reset token is required' })
      .min(1, 'Reset token is required'),
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

const verifyEmailSchema = z.object({
  token: z
    .string({ required_error: 'Verification token is required' })
    .min(1, 'Verification token is required'),
});

const resendVerificationSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
});

const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name cannot exceed 50 characters')
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name cannot exceed 50 characters')
    .optional(),
  phone: z.string().trim().optional().nullable(),
});

export const validateLogin = validate(loginSchema);
export const validateChangePassword = validate(changePasswordSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateResetPassword = validate(resetPasswordSchema);
export const validateVerifyEmail = validate(verifyEmailSchema);
export const validateResendVerification = validate(resendVerificationSchema);
export const validateUpdateProfile = validate(updateProfileSchema);
