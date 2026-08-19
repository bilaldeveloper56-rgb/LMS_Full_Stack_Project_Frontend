import { z } from 'zod';

export const schoolAnalyticsFilterSchema = z.object({
  academicSessionId: z.string().optional().default(''),
  classId: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
});
