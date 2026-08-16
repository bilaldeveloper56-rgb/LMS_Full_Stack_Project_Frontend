import { z } from 'zod';
import {
  ENROLLMENT_STATUS_VALUES,
  GENDER_VALUES,
  BLOOD_GROUP_VALUES,
} from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createStudentSchema = z.object({
  admissionNumber: z
    .string({ required_error: 'Admission number is required' })
    .trim()
    .min(1, 'Admission number is required')
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
  dateOfBirth: z
    .string({ required_error: 'Date of birth is required' })
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date of birth' }),
  gender: z.enum(GENDER_VALUES).default('OTHER'),
  profileImage: z.string().url().nullable().optional(),
  email: z.string().email('Invalid email address').toLowerCase().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
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
  admissionDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid admission date' }).optional(),
  enrollmentStatus: z.enum(ENROLLMENT_STATUS_VALUES).default('ACTIVE'),
  bloodGroup: z.enum(BLOOD_GROUP_VALUES).nullable().optional(),
  emergencyContactName: z.string().trim().max(100).nullable().optional(),
  emergencyContactPhone: z.string().trim().nullable().optional(),
  userId: z.string().regex(objectIdRegex, 'Invalid user ID format').nullable().optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
});

export const updateStudentSchema = z.object({
  admissionNumber: z.string().trim().min(1).max(50).optional(),
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  dateOfBirth: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date of birth' }).optional(),
  gender: z.enum(GENDER_VALUES).optional(),
  profileImage: z.string().url().nullable().optional(),
  email: z.string().email('Invalid email address').toLowerCase().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format').optional(),
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  sectionId: z.string().regex(objectIdRegex, 'Invalid section ID format').optional(),
  rollNumber: z.string().trim().max(50).nullable().optional(),
  admissionDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid admission date' }).optional(),
  enrollmentStatus: z.enum(ENROLLMENT_STATUS_VALUES).optional(),
  bloodGroup: z.enum(BLOOD_GROUP_VALUES).nullable().optional(),
  emergencyContactName: z.string().trim().max(100).nullable().optional(),
  emergencyContactPhone: z.string().trim().nullable().optional(),
  userId: z.string().regex(objectIdRegex, 'Invalid user ID format').nullable().optional(),
});

export const queryStudentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format').optional(),
  sectionId: z.string().regex(objectIdRegex, 'Invalid section ID format').optional(),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format').optional(),
  enrollmentStatus: z.enum(ENROLLMENT_STATUS_VALUES).optional(),
  gender: z.enum(GENDER_VALUES).optional(),
  search: z.string().trim().optional(),
  admissionNumber: z.string().trim().optional(),
  schoolId: z.string().regex(objectIdRegex, 'Invalid school ID format').optional(),
  sortBy: z.enum(['firstName', 'lastName', 'admissionNumber', 'rollNumber', 'createdAt']).default('createdAt'),
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

export const validateCreateStudent = createValidator(createStudentSchema, 'body');
export const validateUpdateStudent = createValidator(updateStudentSchema, 'body');
export const validateQueryStudents = createValidator(queryStudentsSchema, 'query');
