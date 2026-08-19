import { z } from 'zod';

export const RELATIONSHIP_TYPE_OPTIONS = [
  { value: 'FATHER', label: 'Father' },
  { value: 'MOTHER', label: 'Mother' },
  { value: 'GUARDIAN', label: 'Legal Guardian' },
  { value: 'OTHER', label: 'Other Relative' },
];

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const parentFormSchema = z.object({
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
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required'),
  alternatePhone: z.string().trim().optional(),
  address: z.string().trim().max(200).optional(),
  occupation: z.string().trim().max(100).optional(),
  relationship: z.string().trim().max(50).optional(),
  userId: z.string().regex(objectIdRegex, 'Invalid user ID format').optional().or(z.literal('')),
});

export const linkChildSchema = z.object({
  studentId: z
    .string({ required_error: 'Student is required' })
    .regex(objectIdRegex, 'Invalid student ID format'),
  relationshipType: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']).default('GUARDIAN'),
  isPrimary: z.boolean().default(false),
  canPickup: z.boolean().default(true),
  emergencyContact: z.boolean().default(true),
});
