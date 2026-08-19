import { z } from 'zod';

export const COMMON_ENTITY_TYPES = [
  { value: '', label: 'All Entity Types' },
  { value: 'User', label: 'User & Auth' },
  { value: 'School', label: 'School' },
  { value: 'Student', label: 'Student' },
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Attendance', label: 'Attendance' },
  { value: 'FeeInvoice', label: 'Fee Invoice' },
  { value: 'Payment', label: 'Payment' },
  { value: 'Notice', label: 'Notice' },
  { value: 'Quiz', label: 'Quiz' },
  { value: 'Exam', label: 'Exam' },
  { value: 'Result', label: 'Result' },
];

export const auditLogFilterSchema = z.object({
  event: z.string().optional().default(''),
  entityType: z.string().optional().default(''),
  entityId: z.string().optional().default(''),
  userId: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
