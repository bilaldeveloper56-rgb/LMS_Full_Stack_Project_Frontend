import { z } from 'zod';

export const DAY_OF_WEEK_OPTIONS = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

export const PERIOD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const timetableSlotSchema = z
  .object({
    academicSessionId: z.string().regex(objectIdRegex, 'Invalid academic session ID'),
    classId: z.string().regex(objectIdRegex, 'Invalid class ID'),
    sectionId: z.string().regex(objectIdRegex, 'Invalid section ID'),
    subjectId: z.string().regex(objectIdRegex, 'Invalid subject ID'),
    teacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID'),
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
    periodNumber: z.coerce.number().min(1, 'Period must be at least 1').max(12, 'Period cannot exceed 12'),
    startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format (e.g. 08:30)'),
    endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format (e.g. 09:15)'),
    room: z.string().trim().max(50, 'Room cannot exceed 50 characters').optional().or(z.literal('')),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Start time must be earlier than end time',
    path: ['endTime'],
  });

export const updateTimetableSlotSchema = z
  .object({
    subjectId: z.string().regex(objectIdRegex, 'Invalid subject ID').optional(),
    teacherId: z.string().regex(objectIdRegex, 'Invalid teacher ID').optional(),
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),
    periodNumber: z.coerce.number().min(1).max(12).optional(),
    startTime: z.string().regex(timeRegex).optional(),
    endTime: z.string().regex(timeRegex).optional(),
    room: z.string().trim().max(50).optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true;
    },
    {
      message: 'Start time must be earlier than end time',
      path: ['endTime'],
    }
  );
