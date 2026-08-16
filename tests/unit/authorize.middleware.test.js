import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import authorize from '../../src/middlewares/authorize.js';
import { ROLES } from '../../src/constants/index.js';

describe('Authorize Middleware Unit Tests', () => {
  it('should allow access when user has an allowed role (Requirement 23: Authorization middleware)', () => {
    const middleware = authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN);
    const req = { user: { id: '123', role: ROLES.SCHOOL_ADMIN } };
    const res = {};
    let nextCalled = false;
    let nextErr = null;

    middleware(req, res, (err) => {
      nextCalled = true;
      nextErr = err;
    });

    assert.equal(nextCalled, true);
    assert.equal(nextErr, undefined);
  });

  it('should deny access when user has an unauthorized role (Requirement 24: Role restrictions)', () => {
    const middleware = authorize(ROLES.SUPER_ADMIN);
    const req = { user: { id: '123', role: ROLES.STUDENT } };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 403);
    assert.ok(nextErr.message.includes("Role 'STUDENT' is not authorized"));
  });

  it('should reject if req.user is missing', () => {
    const middleware = authorize(ROLES.SUPER_ADMIN);
    const req = {}; // Unauthenticated request
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 401);
  });
});
