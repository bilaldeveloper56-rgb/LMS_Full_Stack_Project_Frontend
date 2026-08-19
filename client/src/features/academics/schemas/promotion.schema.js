import { z } from 'zod';

export const PROMOTION_STATUS = {
  PROMOTED: 'PROMOTED',
  RETAINED: 'RETAINED',
  GRADUATED: 'GRADUATED',
  TRANSFERRED: 'TRANSFERRED',
  WITHDRAWN: 'WITHDRAWN',
};

export const PROMOTION_STATUS_OPTIONS = [
  { label: 'Promoted', value: PROMOTION_STATUS.PROMOTED },
  { label: 'Retained (Repeat Grade)', value: PROMOTION_STATUS.RETAINED },
  { label: 'Graduated', value: PROMOTION_STATUS.GRADUATED },
  { label: 'Transferred', value: PROMOTION_STATUS.TRANSFERRED },
  { label: 'Withdrawn', value: PROMOTION_STATUS.WITHDRAWN },
];

export const promotionFilterSchema = z.object({
  sourceAcademicSessionId: z.string().min(1, 'Please select the current academic session'),
  destinationAcademicSessionId: z.string().min(1, 'Please select the target academic session'),
  sourceClassId: z.string().min(1, 'Please select the source class'),
  sourceSectionId: z.string().min(1, 'Please select the source section'),
  destinationClassId: z.string().optional(),
  destinationSectionId: z.string().optional(),
});
