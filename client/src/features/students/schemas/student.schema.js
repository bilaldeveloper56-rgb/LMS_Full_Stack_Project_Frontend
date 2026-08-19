import { z } from 'zod';

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'GRADUATED', label: 'Graduated' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'EXPELLED', label: 'Expelled' },
];

export const BLOOD_GROUP_OPTIONS = [
  { value: '', label: 'Select Blood Group' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const studentFormSchema = z.object({
  admissionNumber: z
    .string()
    .trim()
    .min(1, 'Admission number is required')
    .max(50, 'Admission number must be at most 50 characters'),
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be at most 50 characters'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid date of birth' }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    errorMap: () => ({ message: 'Please select a valid gender' }),
  }),
  academicSessionId: z
    .string()
    .min(1, 'Academic session is required')
    .regex(objectIdRegex, 'Invalid academic session format'),
  classId: z
    .string()
    .min(1, 'Class is required')
    .regex(objectIdRegex, 'Invalid class format'),
  sectionId: z
    .string()
    .min(1, 'Section is required')
    .regex(objectIdRegex, 'Invalid section format'),
  rollNumber: z.string().trim().max(50).optional().or(z.literal('')),
  admissionDate: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((d) => !d || !isNaN(Date.parse(d)), { message: 'Invalid admission date' }),
  enrollmentStatus: z
    .enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED', 'EXPELLED'])
    .default('ACTIVE'),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().max(200, 'Address too long').optional().or(z.literal('')),
  city: z.string().trim().max(100, 'City too long').optional().or(z.literal('')),
  profileImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  emergencyContactName: z.string().trim().max(100).optional().or(z.literal('')),
  emergencyContactPhone: z.string().trim().optional().or(z.literal('')),
});
