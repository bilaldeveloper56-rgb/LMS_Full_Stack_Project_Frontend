import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import requirePermission from '../../src/middlewares/requirePermission.js';
import { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../../src/constants/index.js';

describe('RequirePermission Middleware Unit Tests', () => {
  it('should allow SUPER_ADMIN to bypass all permission checks', () => {
    const middleware = requirePermission(PERMISSIONS.SCHOOLS_CREATE, PERMISSIONS.SCHOOLS_DELETE);
    const req = { user: { id: '1', role: ROLES.SUPER_ADMIN, schoolId: null, permissions: [] } };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
  });

  it('should allow access when role has the required permission', () => {
    const middleware = requirePermission(PERMISSIONS.FEES_READ);
    const req = {
      user: {
        id: '2',
        role: ROLES.ACCOUNTANT,
        schoolId: 'school-1',
        permissions: DEFAULT_ROLE_PERMISSIONS.ACCOUNTANT,
      },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
  });

  it('should deny access when role lacks the required permission', () => {
    const middleware = requirePermission(PERMISSIONS.SCHOOLS_CREATE);
    const req = {
      user: {
        id: '3',
        role: ROLES.STUDENT,
        schoolId: 'school-1',
        permissions: DEFAULT_ROLE_PERMISSIONS.STUDENT,
      },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 403);
    assert.ok(nextErr.message.includes('Missing required permission(s)'));
    assert.ok(nextErr.message.includes('schools:create'));
  });

  it('should require ALL specified permissions (not just one)', () => {
    // TEACHER has assignments:create but NOT results:publish
    const middleware = requirePermission(PERMISSIONS.ASSIGNMENTS_CREATE, PERMISSIONS.RESULTS_PUBLISH);
    const req = {
      user: {
        id: '4',
        role: ROLES.TEACHER,
        schoolId: 'school-1',
        permissions: DEFAULT_ROLE_PERMISSIONS.TEACHER,
      },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 403);
    assert.ok(nextErr.message.includes('results:publish'));
  });

  it('should allow custom user permissions to supplement role defaults', () => {
    // STAFF lacks fees:read by default, but adding it as custom permission should work
    const middleware = requirePermission(PERMISSIONS.FEES_READ);
    const req = {
      user: {
        id: '5',
        role: ROLES.STAFF,
        schoolId: 'school-1',
        permissions: [...DEFAULT_ROLE_PERMISSIONS.STAFF, PERMISSIONS.FEES_READ],
      },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
  });

  it('should deny STAFF access to permissions not in role defaults or custom list', () => {
    const middleware = requirePermission(PERMISSIONS.FEES_MANAGE);
    const req = {
      user: {
        id: '6',
        role: ROLES.STAFF,
        schoolId: 'school-1',
        permissions: DEFAULT_ROLE_PERMISSIONS.STAFF,
      },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 403);
  });

  it('should return 401 when req.user is missing', () => {
    const middleware = requirePermission(PERMISSIONS.SCHOOLS_READ);
    const req = {};
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 401);
  });

  it('should handle empty permissions array for unknown role gracefully', () => {
    const middleware = requirePermission(PERMISSIONS.SCHOOLS_READ);
    const req = {
      user: {
        id: '7',
        role: 'UNKNOWN_ROLE',
        schoolId: 'school-1',
        permissions: [],
      },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 403);
  });

  it('should allow when no permissions are required (empty args)', () => {
    const middleware = requirePermission();
    const req = {
      user: {
        id: '8',
        role: ROLES.STUDENT,
        schoolId: 'school-1',
        permissions: [],
      },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
  });
});
