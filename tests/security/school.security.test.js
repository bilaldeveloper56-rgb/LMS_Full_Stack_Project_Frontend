import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
import { ROLES, USER_STATUS, SCHOOL_STATUS, AUTH_EVENTS } from '../../src/constants/index.js';
import { logAuditEvent } from '../../src/modules/audit/audit.service.js';
import AuditLog from '../../src/modules/audit/auditLog.model.js';
import * as authService from '../../src/modules/auth/auth.service.js';
import authenticate from '../../src/middlewares/authenticate.js';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env.js';

describe('Phase 3 Security & Multi-Tenancy Governance Tests', () => {
  it('should enforce that SUPER_ADMIN has schoolId = null (Core Rule)', () => {
    const superAdmin = new User({
      firstName: 'Platform',
      lastName: 'Owner',
      email: 'owner@platform.edu',
      passwordHash: 'dummy',
      role: ROLES.SUPER_ADMIN,
      schoolId: null,
      status: USER_STATUS.ACTIVE,
    });

    assert.equal(superAdmin.role, ROLES.SUPER_ADMIN);
    assert.equal(superAdmin.schoolId, null);
  });

  it('should prevent School Admin or other roles from self-assigning SUPER_ADMIN (Requirements 2, 3, 4, 5, 6, 23)', async () => {
    // When updateProfile or user update runs, role and schoolId are not in allowed fields
    const updates = {
      firstName: 'Hacker',
      role: ROLES.SUPER_ADMIN,
      schoolId: null,
    };

    const originalFindByIdAndUpdate = User.findByIdAndUpdate;
    let payloadPassed = null;

    User.findByIdAndUpdate = (id, allowed, opts) => {
      payloadPassed = allowed;
      return Promise.resolve({
        toJSON: () => ({ id, firstName: allowed.firstName }),
      });
    };

    await authService.updateProfile('507f1f77bcf86cd799439002', updates);

    User.findByIdAndUpdate = originalFindByIdAndUpdate;

    assert.equal(payloadPassed.firstName, 'Hacker');
    assert.equal(payloadPassed.role, undefined, 'Role mutation must be forbidden');
    assert.equal(payloadPassed.schoolId, undefined, 'schoolId mutation must be forbidden (Requirement 22)');
  });

  it('should block school users from logging in if school is INACTIVE (Requirement 20: Inactive school cannot login)', async () => {
    const schoolId = '507f1f77bcf86cd799439099';
    const originalFindOneUser = User.findOne;
    const originalFindByIdSchool = School.findById;

    const mockUser = {
      _id: '507f1f77bcf86cd799439002',
      email: 'admin@inactiveschool.edu',
      role: ROLES.SCHOOL_ADMIN,
      schoolId: schoolId,
      status: USER_STATUS.ACTIVE,
      passwordHash: 'hash',
      comparePassword: () => Promise.resolve(true),
    };

    const mockInactiveSchool = {
      _id: schoolId,
      status: SCHOOL_STATUS.INACTIVE,
      isDeleted: false,
    };

    User.findOne = () => ({
      select: () => Promise.resolve(mockUser),
    });
    School.findById = () => Promise.resolve(mockInactiveSchool);

    await assert.rejects(
      async () => {
        await authService.login('admin@inactiveschool.edu', 'Pass123!');
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.ok(err.message.includes('inactive'));
        return true;
      }
    );

    User.findOne = originalFindOneUser;
    School.findById = originalFindByIdSchool;
  });

  it('should block school users from logging in if school is SUSPENDED (Requirement 19: Suspended school)', async () => {
    const schoolId = '507f1f77bcf86cd799439099';
    const originalFindOneUser = User.findOne;
    const originalFindByIdSchool = School.findById;

    const mockUser = {
      _id: '507f1f77bcf86cd799439002',
      email: 'admin@suspendedschool.edu',
      role: ROLES.SCHOOL_ADMIN,
      schoolId: schoolId,
      status: USER_STATUS.ACTIVE,
      passwordHash: 'hash',
      comparePassword: () => Promise.resolve(true),
    };

    const mockSuspendedSchool = {
      _id: schoolId,
      status: SCHOOL_STATUS.SUSPENDED,
      isDeleted: false,
    };

    User.findOne = () => ({
      select: () => Promise.resolve(mockUser),
    });
    School.findById = () => Promise.resolve(mockSuspendedSchool);

    await assert.rejects(
      async () => {
        await authService.login('admin@suspendedschool.edu', 'Pass123!');
      },
      (err) => {
        assert.equal(err.statusCode, 403);
        assert.ok(err.message.includes('suspended'));
        return true;
      }
    );

    User.findOne = originalFindOneUser;
    School.findById = originalFindByIdSchool;
  });

  it('should allow Super Admin authentication regardless of school status (Requirement 21: Super Admin manages suspended schools)', async () => {
    const originalFindByIdUser = User.findById;

    const mockSuperAdmin = {
      _id: '507f1f77bcf86cd799439001',
      role: ROLES.SUPER_ADMIN,
      schoolId: null,
      status: USER_STATUS.ACTIVE,
      changedPasswordAfter: () => false,
    };

    User.findById = () => ({
      select: () => Promise.resolve(mockSuperAdmin),
    });

    const token = jwt.sign(
      { sub: mockSuperAdmin._id, role: ROLES.SUPER_ADMIN, schoolId: null, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    let nextErr = null;

    await authenticate(req, res, (err) => {
      nextErr = err;
    });

    User.findById = originalFindByIdUser;

    assert.equal(nextErr, undefined);
    assert.equal(req.user.role, ROLES.SUPER_ADMIN);
    assert.equal(req.user.schoolId, null);
  });

  it('should generate audit log records for provisioning events (Requirement 26)', async () => {
    const originalAuditLogCreate = AuditLog.create;
    let loggedRecord = null;

    AuditLog.create = (doc) => {
      loggedRecord = doc;
      return Promise.resolve(doc);
    };
    AuditLog.create.isMock = true;

    await logAuditEvent({
      event: AUTH_EVENTS.SCHOOL_CREATED,
      userId: '507f1f77bcf86cd799439001',
      schoolId: '507f1f77bcf86cd799439099',
      entityType: 'School',
      details: { schoolCode: 'TEST-01' },
    });

    AuditLog.create = originalAuditLogCreate;

    assert.ok(loggedRecord);
    assert.equal(loggedRecord.event, AUTH_EVENTS.SCHOOL_CREATED);
    assert.equal(loggedRecord.entityType, 'School');
  });
});
