import { z } from 'zod';

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
  { value: 'LATE', label: 'Late' },
  { value: 'HALF_DAY', label: 'Half Day' },
  { value: 'EXCUSED', label: 'Excused' },
  { value: 'LEAVE', label: 'On Leave' },
];

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const singleAttendanceSchema = z.object({
  studentId: z.string().regex(objectIdRegex, 'Invalid student ID format'),
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format'),
  sectionId: z.string().regex(objectIdRegex, 'Invalid section ID format'),
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format'),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid attendance date' }),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'LEAVE']).default('PRESENT'),
  remarks: z.string().trim().max(250, 'Remarks cannot exceed 250 characters').optional(),
});

export const bulkAttendanceRecordSchema = z.object({
  studentId: z.string().regex(objectIdRegex, 'Invalid student ID format'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'LEAVE']).default('PRESENT'),
  remarks: z.string().trim().max(250).optional(),
});

export const bulkAttendanceSchema = z.object({
  academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID format'),
  classId: z.string().regex(objectIdRegex, 'Invalid class ID format'),
  sectionId: z.string().regex(objectIdRegex, 'Invalid section ID format'),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), { message: 'Invalid attendance date' }),
  records: z.array(bulkAttendanceRecordSchema).min(1, 'At least one student record is required'),
});

export const attendanceCorrectionSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED', 'LEAVE']),
  correctionReason: z
    .string()
    .trim()
    .min(3, 'Correction reason must be at least 3 characters')
    .max(250, 'Correction reason cannot exceed 250 characters'),
});
