import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import School from '../../src/modules/schools/school.model.js';
import * as schoolService from '../../src/modules/schools/school.service.js';
import { SLUG_REGEX, isReservedSubdomain, slugify } from '../../src/constants/index.js';
import { validateCreateSchool } from '../../src/modules/schools/school.validator.js';

describe('School Slug & Reserved Subdomains Unit Tests', () => {
  it('should validate proper slug format with SLUG_REGEX', () => {
    assert.equal(SLUG_REGEX.test('bright-future'), true);
    assert.equal(SLUG_REGEX.test('city-school'), true);
    assert.equal(SLUG_REGEX.test('abc-school-123'), true);
    assert.equal(SLUG_REGEX.test('school'), true);

    // Invalid format
    assert.equal(SLUG_REGEX.test('Bright-Future'), false, 'Uppercase should not match');
    assert.equal(SLUG_REGEX.test('bright_future'), false, 'Underscores not allowed in subdomain slug');
    assert.equal(SLUG_REGEX.test('bright future'), false, 'Spaces not allowed');
    assert.equal(SLUG_REGEX.test('-bright'), false, 'Leading dash not allowed');
    assert.equal(SLUG_REGEX.test('bright-'), false, 'Trailing dash not allowed');
    assert.equal(SLUG_REGEX.test('bright--future'), false, 'Consecutive dashes not allowed');
    assert.equal(SLUG_REGEX.test('bright.future'), false, 'Dots not allowed in slug');
    assert.equal(SLUG_REGEX.test('bright$future'), false, 'Special chars not allowed');
  });

  it('should identify reserved platform subdomains', () => {
    assert.equal(isReservedSubdomain('app'), true);
    assert.equal(isReservedSubdomain('www'), true);
    assert.equal(isReservedSubdomain('api'), true);
    assert.equal(isReservedSubdomain('admin'), true);
    assert.equal(isReservedSubdomain('mail'), true);
    assert.equal(isReservedSubdomain('support'), true);
    assert.equal(isReservedSubdomain('help'), true);
    assert.equal(isReservedSubdomain('status'), true);
    assert.equal(isReservedSubdomain('localhost'), true);
    assert.equal(isReservedSubdomain('superadmin'), true);

    // School names are not reserved
    assert.equal(isReservedSubdomain('bright-future'), false);
    assert.equal(isReservedSubdomain('city-school'), false);
  });

  it('should slugify school names correctly', () => {
    assert.equal(slugify('Bright Future School'), 'bright-future-school');
    assert.equal(slugify('  City School!  '), 'city-school');
    assert.equal(slugify('ABC_Academy---2026'), 'abc-academy-2026');
  });

  it('should reject reserved slug in validateCreateSchool middleware', () => {
    const req = {
      body: {
        school: {
          name: 'App Academy',
          slug: 'app',
          schoolCode: 'APP-01',
          email: 'admin@app.edu',
        },
        admin: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'admin@app.edu',
        },
      },
      query: {},
    };
    let nextErr = null;
    validateCreateSchool(req, {}, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 422);
    assert.ok(nextErr.errors.some((e) => e.includes('reserved')));
  });

  it('should reject invalid slug characters in validateCreateSchool middleware', () => {
    const req = {
      body: {
        school: {
          name: 'Invalid School',
          slug: 'invalid_slug_with_underscores',
          schoolCode: 'INV-01',
          email: 'admin@inv.edu',
        },
        admin: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@inv.edu',
        },
      },
      query: {},
    };
    let nextErr = null;
    validateCreateSchool(req, {}, (err) => {
      nextErr = err;
    });

    assert.ok(nextErr);
    assert.equal(nextErr.statusCode, 422);
    assert.ok(nextErr.errors.some((e) => e.includes('lowercase alphanumeric')));
  });

  it('should check slug availability correctly without exposing private data', async () => {
    // 1. Invalid slug (fails regex before DB)
    const resInvalid = await schoolService.checkSlugAvailability('Invalid_Slug!');
    assert.equal(resInvalid.available, false);
    assert.equal(resInvalid.reason, 'invalid');

    // 2. Reserved slug (fails reserved check before DB)
    const resReserved = await schoolService.checkSlugAvailability('admin');
    assert.equal(resReserved.available, false);
    assert.equal(resReserved.reason, 'reserved');

    // 3. Available slug (when not in DB)
    const originalFindOne = School.findOne;
    School.findOne = () => Promise.resolve(null);
    try {
      const resAvailable = await schoolService.checkSlugAvailability('non-existent-unique-school-slug-12345');
      assert.equal(resAvailable.available, true);

      // 4. Unavailable slug (when found in DB)
      School.findOne = () => Promise.resolve({ slug: 'existing-school' });
      const resUnavailable = await schoolService.checkSlugAvailability('existing-school');
      assert.equal(resUnavailable.available, false);
      assert.equal(resUnavailable.reason, 'unavailable');
    } finally {
      School.findOne = originalFindOne;
    }
  });
});
