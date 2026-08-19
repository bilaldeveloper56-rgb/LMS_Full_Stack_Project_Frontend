import { z } from 'zod';

export const SCHOOL_STATUSES = [
  { value: 'ACTIVE', label: 'Active', variant: 'success' },
  { value: 'PENDING', label: 'Pending Onboarding', variant: 'warning' },
  { value: 'SUSPENDED', label: 'Suspended', variant: 'danger' },
  { value: 'INACTIVE', label: 'Inactive / Archived', variant: 'neutral' },
];

export const createSchoolFormSchema = z.object({
  // School Profile Details
  name: z.string().trim().min(1, 'School name is required').max(100, 'Name cannot exceed 100 characters'),
  schoolCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .regex(/^[A-Z0-9_-]+$/, 'Code can only contain uppercase letters, numbers, hyphens, and underscores'),
  email: z.string().trim().email('Invalid school email address').toLowerCase(),
  phone: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
  city: z.string().trim().optional().default(''),
  province: z.string().trim().optional().default(''),
  country: z.string().trim().default('US'),
  timezone: z.string().default('UTC'),
  currency: z.string().default('USD'),
  language: z.string().default('en'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')).default(''),

  // Initial School Administrator
  adminFirstName: z.string().trim().min(1, 'Admin first name is required').max(50),
  adminLastName: z.string().trim().min(1, 'Admin last name is required').max(50),
  adminEmail: z.string().trim().email('Invalid admin email address').toLowerCase(),
  adminPhone: z.string().trim().optional().default(''),
});

export const updateSchoolFormSchema = z.object({
  name: z.string().trim().min(1, 'School name is required').max(100).optional(),
  email: z.string().trim().email('Invalid email address').toLowerCase().optional(),
  phone: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  province: z.string().trim().optional().nullable(),
  country: z.string().trim().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')).nullable(),
  registrationNumber: z.string().trim().optional().nullable(),
});

export const changeSchoolStatusFormSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE']),
  reason: z.string().trim().optional().default(''),
});
