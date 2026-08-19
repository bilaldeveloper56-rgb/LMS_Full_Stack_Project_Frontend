import { z } from 'zod';

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'TERMINATED', label: 'Terminated' },
  { value: 'RESIGNED', label: 'Resigned' },
];

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const teacherFormSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(1, 'Employee ID is required')
    .max(50, 'Employee ID cannot exceed 50 characters'),
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email address format')
    .toLowerCase(),
  phone: z.string().trim().optional(),
  dateOfBirth: z.string().optional().refine(
    (d) => !d || !isNaN(Date.parse(d)),
    { message: 'Invalid date of birth' }
  ),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('OTHER'),
  qualification: z.string().trim().max(100).optional(),
  specialization: z.string().trim().max(100).optional(),
  joiningDate: z.string().optional().refine(
    (d) => !d || !isNaN(Date.parse(d)),
    { message: 'Invalid joining date' }
  ),
  designation: z.string().trim().max(50).default('Teacher'),
  profileImage: z.string().url().optional().or(z.literal('')),
  employmentStatus: z.enum(['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'RESIGNED']).default('ACTIVE'),
  userId: z.string().regex(objectIdRegex, 'Invalid User ID format').optional().or(z.literal('')),
});
