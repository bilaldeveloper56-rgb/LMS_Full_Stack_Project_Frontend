import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCreateSchool,
  validateUpdateSchool,
  validateChangeStatus,
  validateAcceptInvitation,
  validateQuerySchools,
} from '../../src/modules/schools/school.validator.js';

describe('School Validator Unit Tests', () => {
  const createMockReqRes = (body = {}, query = {}) => {
    const req = { body, query };
    const res = {};
    let nextError = null;
    const next = (err) => {
      nextError = err || null;
    };
    return { req, res, next: () => nextError, run: (middleware) => middleware(req, res, next) };
  };

  it('should pass valid school and admin creation payload (Requirement 11)', () => {
    const mock = createMockReqRes({
      school: {
        name: 'St. Xavier School',
        schoolCode: 'STX-01',
        email: 'info@stxavier.edu',
        city: 'Boston',
        country: 'US',
      },
      admin: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'admin@stxavier.edu',
      },
    });

    mock.run(validateCreateSchool);
    assert.equal(mock.next(), null);
    assert.equal(mock.req.validatedBody.school.name, 'St. Xavier School');
    assert.equal(mock.req.validatedBody.school.schoolCode, 'STX-01');
    assert.equal(mock.req.validatedBody.admin.email, 'admin@stxavier.edu');
  });

  it('should reject invalid school data missing required fields (Requirement 12)', () => {
    const mock = createMockReqRes({
      school: {
        name: '',
        email: 'invalid-email',
      },
      admin: {
        firstName: 'John',
      },
    });

    mock.run(validateCreateSchool);
    const err = mock.next();
    assert.ok(err);
    assert.equal(err.statusCode, 422);
    assert.ok(err.errors.length >= 3);
  });

  it('should reject invalid schoolCode format with special characters', () => {
    const mock = createMockReqRes({
      school: {
        name: 'Test School',
        schoolCode: 'INVALID CODE#@!',
        email: 'test@school.edu',
      },
      admin: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'admin@school.edu',
      },
    });

    mock.run(validateCreateSchool);
    const err = mock.next();
    assert.ok(err);
    assert.equal(err.statusCode, 422);
  });

  it('should validate status change schema', () => {
    const mock = createMockReqRes({
      status: 'SUSPENDED',
      reason: 'Non-payment of subscription',
    });

    mock.run(validateChangeStatus);
    assert.equal(mock.next(), null);
    assert.equal(mock.req.validatedBody.status, 'SUSPENDED');
  });

  it('should reject invalid status in changeStatus', () => {
    const mock = createMockReqRes({ status: 'DESTROYED' });
    mock.run(validateChangeStatus);
    const err = mock.next();
    assert.ok(err);
    assert.equal(err.statusCode, 422);
  });

  it('should validate invitation acceptance with strong matching passwords', () => {
    const mock = createMockReqRes({
      token: 'invitation-raw-token-12345',
      password: 'AdminPassword2026!',
      confirmPassword: 'AdminPassword2026!',
    });

    mock.run(validateAcceptInvitation);
    assert.equal(mock.next(), null);
  });

  it('should reject invitation acceptance when passwords mismatch', () => {
    const mock = createMockReqRes({
      token: 'invitation-raw-token-12345',
      password: 'AdminPassword2026!',
      confirmPassword: 'MismatchPassword2026!',
    });

    mock.run(validateAcceptInvitation);
    const err = mock.next();
    assert.ok(err);
    assert.equal(err.statusCode, 422);
  });

  it('should validate query parameters with defaults', () => {
    const mock = createMockReqRes({}, { page: '2', limit: '25', status: 'ACTIVE' });
    mock.run(validateQuerySchools);
    assert.equal(mock.next(), null);
    assert.equal(mock.req.validatedQuery.page, 2);
    assert.equal(mock.req.validatedQuery.limit, 25);
    assert.equal(mock.req.validatedQuery.status, 'ACTIVE');
  });
});
