import { z } from 'zod';

export const studentRosterQuerySchema = z.object({
  academicSessionId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  enrollmentStatus: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED', 'DROPPED', 'SUSPENDED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const attendanceReportQuerySchema = z.object({
  academicSessionId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  studentId: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  endDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const feeDefaultersQuerySchema = z.object({
  academicSessionId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  minBalance: z.coerce.number().min(0).default(0),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const academicReportCardQuerySchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  academicSessionId: z.string().optional(),
  examId: z.string().optional(),
});
