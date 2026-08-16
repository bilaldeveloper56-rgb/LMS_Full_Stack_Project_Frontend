import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { enforceTenant, requireSchoolMembership, buildTenantQuery } from '../../src/middlewares/tenantIsolation.js';
import { ROLES } from '../../src/constants/index.js';

describe('Tenant Isolation Middleware Unit Tests', () => {
  // --- enforceTenant ---

  it('should set req.tenantId from req.user.schoolId for school-level users', () => {
    const req = {
      user: { id: '1', role: ROLES.TEACHER, schoolId: 'school-abc' },
      body: {},
      query: {},
    };
    const res = {};
    let nextErr = null;

    enforceTenant(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
    assert.equal(req.tenantId, 'school-abc');
  });

  it('should override client-supplied schoolId in req.body with req.user.schoolId', () => {
    const req = {
      user: { id: '1', role: ROLES.TEACHER, schoolId: 'school-abc' },
      body: { schoolId: 'malicious-school-id', name: 'Test' },
      query: {},
    };
    const res = {};
    let nextErr = null;

    enforceTenant(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
    assert.equal(req.body.schoolId, 'school-abc');
    assert.equal(req.body.name, 'Test');
  });

  it('should override client-supplied schoolId in req.query with req.user.schoolId', () => {
    const req = {
      user: { id: '1', role: ROLES.STUDENT, schoolId: 'school-abc' },
      body: {},
      query: { schoolId: 'other-school', status: 'ACTIVE' },
    };
    const res = {};
    let nextErr = null;

    enforceTenant(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
    assert.equal(req.query.schoolId, 'school-abc');
    assert.equal(req.query.status, 'ACTIVE');
  });

  it('should allow SUPER_ADMIN to bypass tenant enforcement', () => {
    const req = {
      user: { id: '1', role: ROLES.SUPER_ADMIN, schoolId: null },
      body: { schoolId: 'any-school-id' },
      query: {},
    };
    const res = {};
    let nextErr = null;

    enforceTenant(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
    // SUPER_ADMIN body is not overwritten
    assert.equal(req.body.schoolId, 'any-school-id');
    assert.equal(req.tenantId, undefined);
  });

  it('should return 403 when school-level user has no schoolId', () => {
    const req = {
      user: { id: '1', role: ROLES.TEACHER, schoolId: null },
      body: {},
      query: {},
    };
    const res = {};
    let nextErr = null;

    enforceTenant(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 403);
  });

  it('should return 401 when req.user is missing', () => {
    const req = { body: {}, query: {} };
    const res = {};
    let nextErr = null;

    enforceTenant(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 401);
  });

  // --- requireSchoolMembership ---

  it('should allow access when route param matches user schoolId', () => {
    const middleware = requireSchoolMembership('schoolId');
    const req = {
      user: { id: '1', role: ROLES.SCHOOL_ADMIN, schoolId: 'school-xyz' },
      params: { schoolId: 'school-xyz' },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
  });

  it('should block access when route param does NOT match user schoolId', () => {
    const middleware = requireSchoolMembership('schoolId');
    const req = {
      user: { id: '1', role: ROLES.TEACHER, schoolId: 'school-xyz' },
      params: { schoolId: 'school-other' },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 403);
    assert.ok(nextErr.message.includes('do not have access'));
  });

  it('should allow SUPER_ADMIN to access any school via requireSchoolMembership', () => {
    const middleware = requireSchoolMembership('schoolId');
    const req = {
      user: { id: '1', role: ROLES.SUPER_ADMIN, schoolId: null },
      params: { schoolId: 'school-any' },
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.equal(nextErr, undefined);
  });

  it('should return 400 when route param is missing in requireSchoolMembership', () => {
    const middleware = requireSchoolMembership('schoolId');
    const req = {
      user: { id: '1', role: ROLES.TEACHER, schoolId: 'school-xyz' },
      params: {},
    };
    const res = {};
    let nextErr = null;

    middleware(req, res, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 400);
  });

  // --- buildTenantQuery ---

  it('should scope query to user schoolId for school-level users', () => {
    const req = {
      user: { id: '1', role: ROLES.TEACHER, schoolId: 'school-abc' },
    };
    const query = buildTenantQuery(req, { status: 'ACTIVE' });

    assert.deepStrictEqual(query, { status: 'ACTIVE', schoolId: 'school-abc' });
  });

  it('should NOT scope query for SUPER_ADMIN', () => {
    const req = {
      user: { id: '1', role: ROLES.SUPER_ADMIN, schoolId: null },
    };
    const query = buildTenantQuery(req, { status: 'ACTIVE' });

    assert.deepStrictEqual(query, { status: 'ACTIVE' });
    assert.equal(query.schoolId, undefined);
  });

  it('should return base query when no additional filters for SUPER_ADMIN', () => {
    const req = {
      user: { id: '1', role: ROLES.SUPER_ADMIN, schoolId: null },
    };
    const query = buildTenantQuery(req);

    assert.deepStrictEqual(query, {});
  });

  it('should throw 401 when req.user is missing in buildTenantQuery', () => {
    const req = {};

    assert.throws(
      () => buildTenantQuery(req, { status: 'ACTIVE' }),
      (err) => err.statusCode === 401
    );
  });
});
