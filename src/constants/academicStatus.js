export const SESSION_STATUS = Object.freeze({
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
});

export const SESSION_STATUS_VALUES = Object.values(SESSION_STATUS);

export const ENROLLMENT_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  GRADUATED: 'GRADUATED',
  TRANSFERRED: 'TRANSFERRED',
  EXPELLED: 'EXPELLED',
});

export const ENROLLMENT_STATUS_VALUES = Object.values(ENROLLMENT_STATUS);

export const EMPLOYMENT_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  SUSPENDED: 'SUSPENDED',
  RESIGNED: 'RESIGNED',
  TERMINATED: 'TERMINATED',
});

export const EMPLOYMENT_STATUS_VALUES = Object.values(EMPLOYMENT_STATUS);

export const SUBJECT_TYPE = Object.freeze({
  CORE: 'CORE',
  ELECTIVE: 'ELECTIVE',
});

export const SUBJECT_TYPE_VALUES = Object.values(SUBJECT_TYPE);

export const RELATIONSHIP_TYPE = Object.freeze({
  FATHER: 'FATHER',
  MOTHER: 'MOTHER',
  GUARDIAN: 'GUARDIAN',
  OTHER: 'OTHER',
});

export const RELATIONSHIP_TYPE_VALUES = Object.values(RELATIONSHIP_TYPE);

export const GENDER = Object.freeze({
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
});

export const GENDER_VALUES = Object.values(GENDER);

export const BLOOD_GROUP = Object.freeze({
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-',
});

export const BLOOD_GROUP_VALUES = Object.values(BLOOD_GROUP);
