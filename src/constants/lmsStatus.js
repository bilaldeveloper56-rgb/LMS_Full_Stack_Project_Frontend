/**
 * LMS Domain status and type constants.
 */

// Days of the week for timetable scheduling
export const DAY_OF_WEEK = Object.freeze({
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
});

export const DAY_OF_WEEK_VALUES = Object.freeze(Object.values(DAY_OF_WEEK));

// Assignment lifecycle
export const ASSIGNMENT_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
});

export const ASSIGNMENT_STATUS_VALUES = Object.freeze(Object.values(ASSIGNMENT_STATUS));

// Assignment submission status
export const SUBMISSION_STATUS = Object.freeze({
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  LATE: 'LATE',
  GRADED: 'GRADED',
  RESUBMITTED: 'RESUBMITTED',
});

export const SUBMISSION_STATUS_VALUES = Object.freeze(Object.values(SUBMISSION_STATUS));

// Quiz lifecycle
export const QUIZ_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
});

export const QUIZ_STATUS_VALUES = Object.freeze(Object.values(QUIZ_STATUS));

// Question types
export const QUESTION_TYPE = Object.freeze({
  MCQ: 'MCQ',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_ANSWER: 'SHORT_ANSWER',
});

export const QUESTION_TYPE_VALUES = Object.freeze(Object.values(QUESTION_TYPE));

// Quiz attempt status
export const QUIZ_ATTEMPT_STATUS = Object.freeze({
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  EVALUATED: 'EVALUATED',
});

export const QUIZ_ATTEMPT_STATUS_VALUES = Object.freeze(Object.values(QUIZ_ATTEMPT_STATUS));

// Exam terms
export const EXAM_TYPE = Object.freeze({
  MID_TERM: 'MID_TERM',
  FINAL: 'FINAL',
  UNIT_TEST: 'UNIT_TEST',
  MOCK: 'MOCK',
  OTHER: 'OTHER',
});

export const EXAM_TYPE_VALUES = Object.freeze(Object.values(EXAM_TYPE));

// Exam status
export const EXAM_STATUS = Object.freeze({
  SCHEDULED: 'SCHEDULED',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

export const EXAM_STATUS_VALUES = Object.freeze(Object.values(EXAM_STATUS));

// Result / Mark status
export const RESULT_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  LOCKED: 'LOCKED',
  PUBLISHED: 'PUBLISHED',
});

export const RESULT_STATUS_VALUES = Object.freeze(Object.values(RESULT_STATUS));
