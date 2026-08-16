import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import sanitizeBody from '../../src/middlewares/sanitizeFields.js';

describe('SanitizeBody Middleware Unit Tests', () => {
  it('should strip protected fields from req.body', () => {
    const middleware = sanitizeBody('role', 'schoolId', 'permissions', 'status', 'isDeleted');
    const req = {
      body: {
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'SUPER_ADMIN',
        schoolId: 'malicious-school-id',
        permissions: ['schools:create'],
        status: 'ACTIVE',
        isDeleted: true,
      },
    };
    const res = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.body.firstName, 'Alice');
    assert.equal(req.body.lastName, 'Smith');
    assert.equal(req.body.role, undefined);
    assert.equal(req.body.schoolId, undefined);
    assert.equal(req.body.permissions, undefined);
    assert.equal(req.body.status, undefined);
    assert.equal(req.body.isDeleted, undefined);
  });

  it('should pass through allowed fields untouched', () => {
    const middleware = sanitizeBody('role', 'schoolId');
    const req = {
      body: {
        firstName: 'Bob',
        lastName: 'Jones',
        phone: '+1234567890',
      },
    };
    const res = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.body.firstName, 'Bob');
    assert.equal(req.body.lastName, 'Jones');
    assert.equal(req.body.phone, '+1234567890');
  });

  it('should handle empty body gracefully', () => {
    const middleware = sanitizeBody('role', 'schoolId');
    const req = { body: {} };
    const res = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.deepStrictEqual(req.body, {});
  });

  it('should handle null body gracefully', () => {
    const middleware = sanitizeBody('role', 'schoolId');
    const req = { body: null };
    const res = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  });

  it('should handle missing body gracefully', () => {
    const middleware = sanitizeBody('role', 'schoolId');
    const req = {};
    const res = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, true);
  });

  it('should strip multiple protected fields from a large body', () => {
    const middleware = sanitizeBody(
      'role', 'schoolId', 'permissions', 'status', 'isDeleted',
      'createdBy', 'passwordHash', '_id', '__v'
    );
    const req = {
      body: {
        firstName: 'Charlie',
        email: 'charlie@test.com',
        role: 'SUPER_ADMIN',
        schoolId: 'evil-id',
        permissions: ['*'],
        status: 'ACTIVE',
        isDeleted: false,
        createdBy: 'attacker-id',
        passwordHash: '$2a$10$fake',
        _id: 'custom-id',
        __v: 999,
      },
    };
    const res = {};

    middleware(req, res, () => {});

    assert.equal(req.body.firstName, 'Charlie');
    assert.equal(req.body.email, 'charlie@test.com');
    assert.equal(req.body.role, undefined);
    assert.equal(req.body.schoolId, undefined);
    assert.equal(req.body.permissions, undefined);
    assert.equal(req.body.status, undefined);
    assert.equal(req.body.isDeleted, undefined);
    assert.equal(req.body.createdBy, undefined);
    assert.equal(req.body.passwordHash, undefined);
    assert.equal(req.body._id, undefined);
    assert.equal(req.body.__v, undefined);
  });
});
