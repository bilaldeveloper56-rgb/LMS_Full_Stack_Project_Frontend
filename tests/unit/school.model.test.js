import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import School from '../../src/modules/schools/school.model.js';
import { SCHOOL_STATUS } from '../../src/constants/index.js';

describe('School Model Unit Tests', () => {
  it('should instantiate school with valid fields and defaults', () => {
    const school = new School({
      name: 'Springfield Academy',
      schoolCode: 'SPR-001',
      email: 'contact@springfield.edu',
    });

    assert.equal(school.name, 'Springfield Academy');
    assert.equal(school.schoolCode, 'SPR-001');
    assert.equal(school.email, 'contact@springfield.edu');
    assert.equal(school.status, SCHOOL_STATUS.ACTIVE);
    assert.equal(school.timezone, 'UTC');
    assert.equal(school.currency, 'PKR');
    assert.equal(school.language, 'en');
  });

  it('should reject invalid school status', () => {
    const school = new School({
      name: 'Invalid School',
      schoolCode: 'INV-001',
      email: 'invalid@school.edu',
      status: 'NON_EXISTENT_STATUS',
    });

    const validationErr = school.validateSync();
    assert.ok(validationErr);
    assert.ok(validationErr.errors.status);
  });

  it('should strip internal soft-delete flags in toJSON', () => {
    const school = new School({
      name: 'Oakridge High',
      schoolCode: 'OAK-100',
      email: 'info@oakridge.edu',
      isDeleted: false,
    });

    const json = school.toJSON();
    assert.equal(json.name, 'Oakridge High');
    assert.equal(json.isDeleted, undefined, 'isDeleted must be stripped in toJSON');
    assert.equal(json.__v, undefined);
  });
});
