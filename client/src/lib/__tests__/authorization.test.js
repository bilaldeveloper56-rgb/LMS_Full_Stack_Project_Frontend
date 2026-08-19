import { describe, it, expect } from 'vitest';
import {
  getEffectivePermissions,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccess,
} from '../authorization';
import { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/constants';

describe('Authorization Utilities & Helpers', () => {
  describe('getEffectivePermissions', () => {
    it('should return empty Set for null or unauthenticated user', () => {
      expect(getEffectivePermissions(null).size).toBe(0);
      expect(getEffectivePermissions({}).size).toBe(0);
      expect(getEffectivePermissions({ role: null }).size).toBe(0);
    });

    it('should return all permissions for SUPER_ADMIN', () => {
      const user = { id: 'u1', role: ROLES.SUPER_ADMIN };
      const perms = getEffectivePermissions(user);

      expect(perms.has(PERMISSIONS.SCHOOLS_MANAGE)).toBe(true);
      expect(perms.has(PERMISSIONS.AUDIT_LOGS_READ)).toBe(true);
      expect(perms.has(PERMISSIONS.FEES_DELETE)).toBe(true);
    });

    it('should return default permissions for standard roles', () => {
      const teacher = { id: 't1', role: ROLES.TEACHER };
      const perms = getEffectivePermissions(teacher);

      expect(perms.has(PERMISSIONS.ASSIGNMENTS_CREATE)).toBe(true);
      expect(perms.has(PERMISSIONS.ATTENDANCE_READ)).toBe(true);
      expect(perms.has(PERMISSIONS.SCHOOLS_MANAGE)).toBe(false);
      expect(perms.has(PERMISSIONS.AUDIT_LOGS_READ)).toBe(false);
    });

    it('should additively merge custom per-user permissions', () => {
      const teacherWithCustomPerm = {
        id: 't2',
        role: ROLES.TEACHER,
        permissions: [PERMISSIONS.AUDIT_LOGS_READ, PERMISSIONS.FEES_READ],
      };
      const perms = getEffectivePermissions(teacherWithCustomPerm);

      expect(perms.has(PERMISSIONS.ASSIGNMENTS_CREATE)).toBe(true);
      expect(perms.has(PERMISSIONS.AUDIT_LOGS_READ)).toBe(true);
      expect(perms.has(PERMISSIONS.FEES_READ)).toBe(true);
    });
  });

  describe('hasRole, hasAnyRole, hasAllRoles', () => {
    const user = { id: 'u1', role: ROLES.SCHOOL_ADMIN };

    it('hasRole should evaluate single role correctly', () => {
      expect(hasRole(user, ROLES.SCHOOL_ADMIN)).toBe(true);
      expect(hasRole(user, ROLES.TEACHER)).toBe(false);
      expect(hasRole(null, ROLES.SCHOOL_ADMIN)).toBe(false);
      expect(hasRole(user, null)).toBe(false);
    });

    it('hasAnyRole should check if user has at least one role in the list', () => {
      expect(hasAnyRole(user, [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN])).toBe(true);
      expect(hasAnyRole(user, [ROLES.TEACHER, ROLES.STUDENT])).toBe(false);
      expect(hasAnyRole(null, [ROLES.SCHOOL_ADMIN])).toBe(false);
      expect(hasAnyRole(user, [])).toBe(false);
    });

    it('hasAllRoles should evaluate correctly', () => {
      expect(hasAllRoles(user, [ROLES.SCHOOL_ADMIN])).toBe(true);
      expect(hasAllRoles(user, [ROLES.SCHOOL_ADMIN, ROLES.TEACHER])).toBe(false);
      expect(hasAllRoles(null, [ROLES.SCHOOL_ADMIN])).toBe(false);
    });
  });

  describe('hasPermission, hasAnyPermission, hasAllPermissions', () => {
    it('SUPER_ADMIN should bypass all permission checks', () => {
      const superAdmin = { id: 'sa', role: ROLES.SUPER_ADMIN };

      expect(hasPermission(superAdmin, PERMISSIONS.SCHOOLS_MANAGE)).toBe(true);
      expect(hasPermission(superAdmin, PERMISSIONS.AUDIT_LOGS_READ)).toBe(true);
      expect(hasAnyPermission(superAdmin, [PERMISSIONS.SCHOOLS_MANAGE])).toBe(true);
      expect(hasAllPermissions(superAdmin, [PERMISSIONS.SCHOOLS_MANAGE, PERMISSIONS.FEES_MANAGE])).toBe(true);
    });

    it('should correctly evaluate standard role permissions', () => {
      const student = { id: 's1', role: ROLES.STUDENT };

      expect(hasPermission(student, PERMISSIONS.ASSIGNMENTS_READ)).toBe(true);
      expect(hasPermission(student, PERMISSIONS.FEES_CREATE)).toBe(false);
      expect(hasPermission(null, PERMISSIONS.ASSIGNMENTS_READ)).toBe(false);
      expect(hasPermission(student, null)).toBe(false);
    });

    it('hasAnyPermission should return true if any permission matches', () => {
      const accountant = { id: 'a1', role: ROLES.ACCOUNTANT };

      expect(
        hasAnyPermission(accountant, [PERMISSIONS.FEES_CREATE, PERMISSIONS.ASSIGNMENTS_CREATE])
      ).toBe(true);

      expect(
        hasAnyPermission(accountant, [PERMISSIONS.ASSIGNMENTS_CREATE, PERMISSIONS.QUIZZES_CREATE])
      ).toBe(false);
    });

    it('hasAllPermissions should require all permissions to match', () => {
      const schoolAdmin = { id: 'adm', role: ROLES.SCHOOL_ADMIN };

      expect(
        hasAllPermissions(schoolAdmin, [PERMISSIONS.STUDENTS_READ, PERMISSIONS.TEACHERS_READ])
      ).toBe(true);

      // School Admin does not have platform-level SCHOOLS_MANAGE (reserved for SUPER_ADMIN)
      expect(
        hasAllPermissions(schoolAdmin, [PERMISSIONS.STUDENTS_READ, PERMISSIONS.SCHOOLS_MANAGE])
      ).toBe(false);
    });
  });

  describe('canAccess general evaluator', () => {
    it('should return false for null user', () => {
      expect(canAccess(null, { roles: [ROLES.TEACHER] })).toBe(false);
    });

    it('should respect hideForRoles', () => {
      const superAdmin = { id: 'sa', role: ROLES.SUPER_ADMIN };
      expect(canAccess(superAdmin, { hideForRoles: [ROLES.SUPER_ADMIN] })).toBe(false);
    });

    it('should check role criteria', () => {
      const teacher = { id: 't1', role: ROLES.TEACHER };
      expect(canAccess(teacher, { roles: [ROLES.TEACHER, ROLES.SCHOOL_ADMIN] })).toBe(true);
      expect(canAccess(teacher, { roles: [ROLES.SUPER_ADMIN] })).toBe(false);
    });

    it('should check permission criteria with any / all modes', () => {
      const accountant = { id: 'acc', role: ROLES.ACCOUNTANT };

      expect(
        canAccess(accountant, {
          permissions: [PERMISSIONS.FEES_READ, PERMISSIONS.ASSIGNMENTS_CREATE],
          mode: 'any',
        })
      ).toBe(true);

      expect(
        canAccess(accountant, {
          permissions: [PERMISSIONS.FEES_READ, PERMISSIONS.ASSIGNMENTS_CREATE],
          mode: 'all',
        })
      ).toBe(false);
    });
  });
});
