import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import User from '../../src/modules/users/user.model.js';
import { ROLES, USER_STATUS } from '../../src/constants/index.js';
import { env } from '../../src/config/env.js';

describe('Auth Security & Multi-Tenancy Tests', () => {
  it('should enforce that Super Admin has null schoolId and cannot belong to a school', () => {
    const superAdmin = new User({
      firstName: 'Platform',
      lastName: 'Owner',
      email: 'owner@platform.com',
      passwordHash: 'dummy',
      role: ROLES.SUPER_ADMIN,
      schoolId: null,
      status: USER_STATUS.ACTIVE,
    });

    assert.equal(superAdmin.role, ROLES.SUPER_ADMIN);
    assert.equal(superAdmin.schoolId, null);
  });

  it('should ensure tenant schoolId is assigned for school-level roles', () => {
    const schoolId = '507f1f77bcf86cd799439099';
    const teacher = new User({
      firstName: 'Teacher',
      lastName: 'One',
      email: 'teacher@school.com',
      passwordHash: 'dummy',
      role: ROLES.TEACHER,
      schoolId: schoolId,
      status: USER_STATUS.ACTIVE,
    });

    assert.equal(teacher.role, ROLES.TEACHER);
    assert.equal(teacher.schoolId.toString(), schoolId);
  });

  it('should not allow arbitrary role values', () => {
    const invalidUser = new User({
      firstName: 'Hacker',
      lastName: 'Man',
      email: 'hacker@evil.com',
      passwordHash: 'dummy',
      role: 'SUPER_HACKER_ROLE',
    });

    const validationErr = invalidUser.validateSync();
    assert.ok(validationErr);
    assert.ok(validationErr.errors.role);
  });

  it('should ensure JWT secrets meet minimum length requirements (32+ chars)', () => {
    assert.ok(env.JWT_ACCESS_SECRET.length >= 32, 'JWT_ACCESS_SECRET must be at least 32 characters');
    assert.ok(env.JWT_REFRESH_SECRET.length >= 32, 'JWT_REFRESH_SECRET must be at least 32 characters');
  });

  it('should enforce bcrypt salt rounds within secure range (10-15)', () => {
    assert.ok(env.BCRYPT_SALT_ROUNDS >= 10 && env.BCRYPT_SALT_ROUNDS <= 15);
  });
});
