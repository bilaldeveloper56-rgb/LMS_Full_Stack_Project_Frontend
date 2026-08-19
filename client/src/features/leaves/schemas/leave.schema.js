import { z } from 'zod';

export const LEAVE_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const LEAVE_TYPE_OPTIONS = [
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'CASUAL', label: 'Casual Leave' },
  { value: 'EMERGENCY', label: 'Emergency Leave' },
  { value: 'MEDICAL', label: 'Medical Leave' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
  { value: 'PATERNITY', label: 'Paternity Leave' },
  { value: 'OTHER', label: 'Other Leave' },
];

export const LEAVE_DAY_TYPE_OPTIONS = [
  { value: 'FULL_DAY', label: 'Full Day' },
  { value: 'HALF_DAY', label: 'Half Day' },
];

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const leaveApplicationSchema = z
  .object({
    leaveType: z.enum(['SICK', 'CASUAL', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'MEDICAL', 'OTHER']),
    dayType: z.enum(['FULL_DAY', 'HALF_DAY']).default('FULL_DAY'),
    startDate: z
      .string({ required_error: 'Start date is required' })
      .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid start date' }),
    endDate: z
      .string({ required_error: 'End date is required' })
      .refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid end date' }),
    reason: z
      .string()
      .trim()
      .min(5, 'Reason must be at least 5 characters')
      .max(500, 'Reason cannot exceed 500 characters'),
    studentId: z.string().regex(objectIdRegex, 'Invalid student ID').optional().or(z.literal('')),
    teacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID').optional().or(z.literal('')),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  });

export const leaveRejectionSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters')
    .max(250, 'Rejection reason cannot exceed 250 characters'),
});
