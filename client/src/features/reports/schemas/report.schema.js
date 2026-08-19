import { z } from 'zod';

export const REPORT_TYPES = [
  {
    id: 'students',
    label: 'Student Roster',
    description: 'Detailed enrollment, demographics, class, and section listings',
  },
  {
    id: 'attendance',
    label: 'Attendance Register',
    description: 'Cumulative attendance rates, present/absent counts, and percentages',
  },
  {
    id: 'financial',
    label: 'Fee Dues & Defaulters',
    description: 'Outstanding invoice balances, payment records, and overdue tracking',
  },
  {
    id: 'academic',
    label: 'Academic Report Card',
    description: 'Student transcripts, GPA calculations, exam scores, and pass/fail metrics',
  },
];

export const studentRosterFilterSchema = z.object({
  academicSessionId: z.string().optional().default(''),
  classId: z.string().optional().default(''),
  sectionId: z.string().optional().default(''),
  enrollmentStatus: z.string().optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const attendanceReportFilterSchema = z.object({
  academicSessionId: z.string().optional().default(''),
  classId: z.string().optional().default(''),
  sectionId: z.string().optional().default(''),
  studentId: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const feeDefaultersFilterSchema = z.object({
  academicSessionId: z.string().optional().default(''),
  classId: z.string().optional().default(''),
  sectionId: z.string().optional().default(''),
  minBalance: z.coerce.number().min(0).default(0),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const academicReportCardFilterSchema = z.object({
  studentId: z.string().min(1, 'Please select a student to generate their report card'),
  academicSessionId: z.string().optional().default(''),
  examId: z.string().optional().default(''),
});
