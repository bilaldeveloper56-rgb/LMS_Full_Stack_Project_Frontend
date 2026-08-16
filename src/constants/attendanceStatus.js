/**
 * Attendance & Leave Enums and Constants
 * Phase 6
 */

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  HALF_DAY: 'HALF_DAY',
  EXCUSED: 'EXCUSED',
  LEAVE: 'LEAVE',
});

export const ATTENDANCE_STATUS_VALUES = Object.freeze(Object.values(ATTENDANCE_STATUS));

export const ATTENDANCE_SOURCE = Object.freeze({
  MANUAL: 'MANUAL',
  CARD: 'CARD',
  IMPORT: 'IMPORT',
  SYSTEM: 'SYSTEM',
});

export const ATTENDANCE_SOURCE_VALUES = Object.freeze(Object.values(ATTENDANCE_SOURCE));

export const LEAVE_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
});

export const LEAVE_STATUS_VALUES = Object.freeze(Object.values(LEAVE_STATUS));

export const LEAVE_TYPE = Object.freeze({
  SICK: 'SICK',
  CASUAL: 'CASUAL',
  EMERGENCY: 'EMERGENCY',
  MATERNITY: 'MATERNITY',
  PATERNITY: 'PATERNITY',
  MEDICAL: 'MEDICAL',
  OTHER: 'OTHER',
});

export const LEAVE_TYPE_VALUES = Object.freeze(Object.values(LEAVE_TYPE));

export const LEAVE_DAY_TYPE = Object.freeze({
  FULL_DAY: 'FULL_DAY',
  HALF_DAY: 'HALF_DAY',
});

export const LEAVE_DAY_TYPE_VALUES = Object.freeze(Object.values(LEAVE_DAY_TYPE));
