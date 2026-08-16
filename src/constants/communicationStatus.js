/**
 * Enums and constants for Notices, Notifications, and Internal Messaging.
 */
export const NOTICE_PRIORITY = Object.freeze({
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  URGENT: 'URGENT',
});

export const NOTICE_PRIORITY_VALUES = Object.freeze(Object.values(NOTICE_PRIORITY));

export const TARGET_AUDIENCE = Object.freeze({
  ALL: 'ALL',
  TEACHERS: 'TEACHERS',
  STUDENTS: 'STUDENTS',
  PARENTS: 'PARENTS',
  CLASS_SPECIFIC: 'CLASS_SPECIFIC',
});

export const TARGET_AUDIENCE_VALUES = Object.freeze(Object.values(TARGET_AUDIENCE));

export const NOTIFICATION_TYPE = Object.freeze({
  ACADEMIC: 'ACADEMIC',
  ATTENDANCE: 'ATTENDANCE',
  FEE: 'FEE',
  LEAVE: 'LEAVE',
  EXAM: 'EXAM',
  ASSIGNMENT: 'ASSIGNMENT',
  QUIZ: 'QUIZ',
  NOTICE: 'NOTICE',
  SYSTEM: 'SYSTEM',
});

export const NOTIFICATION_TYPE_VALUES = Object.freeze(Object.values(NOTIFICATION_TYPE));

export const NOTIFICATION_SEVERITY = Object.freeze({
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
});

export const NOTIFICATION_SEVERITY_VALUES = Object.freeze(Object.values(NOTIFICATION_SEVERITY));

export const CONVERSATION_TYPE = Object.freeze({
  DIRECT: 'DIRECT',
  GROUP: 'GROUP',
});

export const CONVERSATION_TYPE_VALUES = Object.freeze(Object.values(CONVERSATION_TYPE));
