/**
 * Role definitions strictly mirroring the backend RBAC contract.
 */
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  SCHOOL_ADMIN: 'SCHOOL_ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
  ACCOUNTANT: 'ACCOUNTANT',
  LIBRARIAN: 'LIBRARIAN',
  STAFF: 'STAFF',
});

export const ROLE_VALUES = Object.freeze(Object.values(ROLES));

/**
 * Human-readable display labels for user roles.
 */
export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.SCHOOL_ADMIN]: 'School Admin',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT]: 'Student',
  [ROLES.PARENT]: 'Parent',
  [ROLES.ACCOUNTANT]: 'Accountant',
  [ROLES.LIBRARIAN]: 'Librarian',
  [ROLES.STAFF]: 'Staff',
});
