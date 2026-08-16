import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import authenticate from '../../src/middlewares/authenticate.js';
import { env } from '../../src/config/env.js';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
import { ROLES, USER_STATUS, SCHOOL_STATUS } from '../../src/constants/index.js';

describe('Authenticate Middleware Unit Tests', () => {
  it('should reject requests without authorization header (Requirement 14: /auth/me requires authentication)', async () => {
    const req = { headers: {} };
    const res = {};
    let errResult = null;

    await authenticate(req, res, (err) => {
      errResult = err;
    });

    assert.ok(errResult);
    assert.equal(errResult.statusCode, 401);
    assert.equal(errResult.message, 'Access token required');
  });

  it('should reject invalid access token (Requirement 8: Invalid access token)', async () => {
    const req = { headers: { authorization: 'Bearer invalid.token.structure' } };
    const res = {};
    let errResult = null;

    await authenticate(req, res, (err) => {
      errResult = err;
    });

    assert.ok(errResult);
    assert.equal(errResult.statusCode, 401);
    assert.equal(errResult.message, 'Invalid access token');
  });

  it('should reject expired access token (Requirement 7: Expired access token)', async () => {
    const expiredToken = jwt.sign(
      { sub: '507f1f77bcf86cd799439011', role: ROLES.TEACHER, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '-1s' }
    );

    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    const res = {};
    let errResult = null;

    await authenticate(req, res, (err) => {
      errResult = err;
    });

    assert.ok(errResult);
    assert.equal(errResult.statusCode, 401);
    assert.equal(errResult.message, 'Access token has expired');
  });

  it('should reject tokens with wrong token type', async () => {
    const wrongTypeToken = jwt.sign(
      { sub: '507f1f77bcf86cd799439011', role: ROLES.TEACHER, type: 'refresh' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    const req = { headers: { authorization: `Bearer ${wrongTypeToken}` } };
    const res = {};
    let errResult = null;

    await authenticate(req, res, (err) => {
      errResult = err;
    });

    assert.ok(errResult);
    assert.equal(errResult.statusCode, 401);
    assert.equal(errResult.message, 'Invalid token type');
  });

  it('should attach user context to req.user for valid token and active user (Requirement 6: Access token validation)', async () => {
    const dummyId = '507f1f77bcf86cd799439011';
    const originalFindByIdUser = User.findById;
    const originalFindByIdSchool = School.findById;

    User.findById = (id) => ({
      select: () =>
        Promise.resolve({
          _id: id,
          role: ROLES.TEACHER,
          schoolId: '507f1f77bcf86cd799439022',
          status: USER_STATUS.ACTIVE,
          changedPasswordAfter: () => false,
        }),
    });

    School.findById = () =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439022',
        status: SCHOOL_STATUS.ACTIVE,
        isDeleted: false,
      });

    const validToken = jwt.sign(
      { sub: dummyId, role: ROLES.TEACHER, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = {};
    let errResult = null;

    await authenticate(req, res, (err) => {
      errResult = err;
    });

    User.findById = originalFindByIdUser;
    School.findById = originalFindByIdSchool;

    assert.equal(errResult, undefined);
    assert.ok(req.user);
    assert.equal(req.user.id, dummyId);
    assert.equal(req.user.role, ROLES.TEACHER);
    assert.equal(req.user.schoolId, '507f1f77bcf86cd799439022');
    assert.equal(req.user.status, USER_STATUS.ACTIVE);
  });

  it('should reject disabled user (Requirement 5: Disabled user login / access)', async () => {
    const dummyId = '507f1f77bcf86cd799439011';
    const originalFindById = User.findById;

    User.findById = (id) => ({
      select: () =>
        Promise.resolve({
          _id: id,
          role: ROLES.TEACHER,
          status: USER_STATUS.DISABLED,
          changedPasswordAfter: () => false,
        }),
    });

    const token = jwt.sign(
      { sub: dummyId, role: ROLES.TEACHER, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    let errResult = null;

    await authenticate(req, res, (err) => {
      errResult = err;
    });

    User.findById = originalFindById;

    assert.ok(errResult);
    assert.equal(errResult.statusCode, 403);
    assert.equal(errResult.message, 'Account has been disabled');
  });

  it('should reject suspended user (Requirement 4: Suspended user login / access)', async () => {
    const dummyId = '507f1f77bcf86cd799439011';
    const originalFindById = User.findById;

    User.findById = (id) => ({
      select: () =>
        Promise.resolve({
          _id: id,
          role: ROLES.TEACHER,
          status: USER_STATUS.SUSPENDED,
          changedPasswordAfter: () => false,
        }),
    });

    const token = jwt.sign(
      { sub: dummyId, role: ROLES.TEACHER, type: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    let errResult = null;

    await authenticate(req, res, (err) => {
      errResult = err;
    });

    User.findById = originalFindById;

    assert.ok(errResult);
    assert.equal(errResult.statusCode, 403);
    assert.equal(errResult.message, 'Account has been suspended');
  });
});
