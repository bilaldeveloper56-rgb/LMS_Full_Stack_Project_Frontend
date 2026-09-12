import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { enforceTenant } from '../../src/middlewares/tenantIsolation.js';
import { getPublicTenantConfigBySlug } from '../../src/modules/schools/school.service.js';
import School from '../../src/modules/schools/school.model.js';
import { ROLES, SCHOOL_STATUS } from '../../src/constants/index.js';

describe('Tenant Subdomain Security & Boundary Tests', () => {
  it('should block School A user trying to access School B subdomain via trusted host', async () => {
    // Stub School.findOne to return School B
    const originalFindOne = School.findOne;
    School.findOne = () => ({
      select: () => Promise.resolve({
        _id: 'school-b-id',
        name: 'City School',
        slug: 'city-school',
        status: SCHOOL_STATUS.ACTIVE,
      }),
      then: function (resolve) {
        return Promise.resolve({
          _id: 'school-b-id',
          name: 'City School',
          slug: 'city-school',
          status: SCHOOL_STATUS.ACTIVE,
        }).then(resolve);
      },
    });

    try {
      const req = {
        user: { id: 'user-a', role: ROLES.TEACHER, schoolId: 'school-a-id' },
        headers: {
          host: 'city-school.lmsprime.online',
        },
        body: {},
        query: {},
      };
      const res = {};

      await new Promise((resolve) => {
        enforceTenant(req, res, (err) => {
          assert.ok(err, 'Expected 403 error for cross-tenant access');
          assert.equal(err.statusCode, 403);
          assert.ok(err.message.includes('You do not have access'));
          resolve();
        });
      });
    } finally {
      School.findOne = originalFindOne;
    }
  });

  it('should allow School A user on School A subdomain and override client-supplied schoolId', async () => {
    const originalFindOne = School.findOne;
    School.findOne = () => ({
      then: function (resolve) {
        return Promise.resolve({
          _id: 'school-a-id',
          name: 'Bright Future School',
          slug: 'bright-future',
          status: SCHOOL_STATUS.ACTIVE,
        }).then(resolve);
      },
    });

    try {
      const req = {
        user: { id: 'user-a', role: ROLES.TEACHER, schoolId: 'school-a-id' },
        headers: {
          host: 'bright-future.lmsprime.online',
        },
        body: { schoolId: 'malicious-injected-id', name: 'Student Data' },
        query: { schoolId: 'malicious-query-id' },
      };
      const res = {};

      await new Promise((resolve) => {
        enforceTenant(req, res, (err) => {
          assert.equal(err, undefined);
          assert.equal(req.tenantId, 'school-a-id');
          // Verified that body and query are strictly overridden:
          assert.equal(req.body.schoolId, 'school-a-id');
          assert.equal(req.query.schoolId, 'school-a-id');
          resolve();
        });
      });
    } finally {
      School.findOne = originalFindOne;
    }
  });

  it('should prevent X-Tenant-Subdomain spoofing on production host', async () => {
    const originalFindOne = School.findOne;
    School.findOne = () => ({
      then: function (resolve) {
        return Promise.resolve({
          _id: 'school-a-id',
          name: 'Bright Future School',
          slug: 'bright-future',
          status: SCHOOL_STATUS.ACTIVE,
        }).then(resolve);
      },
    });

    try {
      // User is on bright-future, but passes X-Tenant-Subdomain: city-school
      const req = {
        user: { id: 'user-a', role: ROLES.TEACHER, schoolId: 'school-a-id' },
        headers: {
          host: 'bright-future.lmsprime.online',
          'x-tenant-subdomain': 'city-school',
        },
        body: {},
        query: {},
      };
      const res = {};

      await new Promise((resolve) => {
        enforceTenant(req, res, (err) => {
          assert.equal(err, undefined);
          assert.equal(req.tenantId, 'school-a-id');
          assert.equal(req.subdomainTenant.slug, 'bright-future');
          resolve();
        });
      });
    } finally {
      School.findOne = originalFindOne;
    }
  });

  it('should prevent Origin spoofing from overriding tenant identity', async () => {
    const originalFindOne = School.findOne;
    School.findOne = () => ({
      then: function (resolve) {
        return Promise.resolve({
          _id: 'school-a-id',
          name: 'Bright Future School',
          slug: 'bright-future',
          status: SCHOOL_STATUS.ACTIVE,
        }).then(resolve);
      },
    });

    try {
      const req = {
        user: { id: 'user-a', role: ROLES.TEACHER, schoolId: 'school-a-id' },
        headers: {
          host: 'bright-future.lmsprime.online',
          origin: 'https://city-school.lmsprime.online',
        },
        body: {},
        query: {},
      };
      const res = {};

      await new Promise((resolve) => {
        enforceTenant(req, res, (err) => {
          assert.equal(err, undefined);
          assert.equal(req.tenantId, 'school-a-id');
          assert.equal(req.subdomainTenant.slug, 'bright-future');
          resolve();
        });
      });
    } finally {
      School.findOne = originalFindOne;
    }
  });

  it('should return TENANT_NOT_FOUND when accessing non-existent subdomain', async () => {
    const originalFindOne = School.findOne;
    School.findOne = () => ({
      then: function (resolve) {
        return Promise.resolve(null).then(resolve);
      },
    });

    try {
      const req = {
        user: { id: 'user-a', role: ROLES.TEACHER, schoolId: 'school-a-id' },
        headers: {
          host: 'non-existent.lmsprime.online',
        },
        body: {},
        query: {},
      };
      const res = {};

      await new Promise((resolve) => {
        enforceTenant(req, res, (err) => {
          assert.ok(err);
          assert.equal(err.code, 'TENANT_NOT_FOUND');
          assert.equal(err.statusCode, 404);
          resolve();
        });
      });
    } finally {
      School.findOne = originalFindOne;
    }
  });

  it('should allow SUPER_ADMIN on platform host app.lmsprime.online without tenant scoping', async () => {
    const req = {
      user: { id: 'super-admin-id', role: ROLES.SUPER_ADMIN, schoolId: null },
      headers: {
        host: 'app.lmsprime.online',
      },
      body: { schoolId: 'any-school' },
      query: {},
    };
    const res = {};

    await new Promise((resolve) => {
      enforceTenant(req, res, (err) => {
        assert.equal(err, undefined);
        assert.equal(req.tenantId, undefined);
        assert.equal(req.body.schoolId, 'any-school');
        resolve();
      });
    });
  });

  it('should enforce tenant scoping for normal school user on app.lmsprime.online and block escape', async () => {
    const req = {
      user: { id: 'user-a', role: ROLES.TEACHER, schoolId: 'school-a-id' },
      headers: {
        host: 'app.lmsprime.online',
      },
      body: { schoolId: 'malicious-injected-school-b' },
      query: { schoolId: 'other-school' },
    };
    const res = {};

    await new Promise((resolve) => {
      enforceTenant(req, res, (err) => {
        assert.equal(err, undefined);
        // Normal user must still be scoped to their schoolId
        assert.equal(req.tenantId, 'school-a-id');
        // Any injected schoolId must be overwritten with authenticated schoolId
        assert.equal(req.body.schoolId, 'school-a-id');
        assert.equal(req.query.schoolId, 'school-a-id');
        resolve();
      });
    });
  });

  it('should ensure getPublicTenantConfigBySlug returns ONLY public fields', async () => {
    const originalFindOne = School.findOne;
    School.findOne = () => ({
      select: () =>
        Promise.resolve({
          name: 'Bright Future School',
          slug: 'bright-future',
          logo: 'https://cdn.example.com/logo.png',
          status: SCHOOL_STATUS.ACTIVE,
          // Internal fields that should NOT be in the returned object
          email: 'admin@brightfuture.com',
          passwordHash: 'secret_hash',
          jwtSecret: 'secret_jwt',
        }),
    });

    try {
      const config = await getPublicTenantConfigBySlug('bright-future');

      assert.deepEqual(config, {
        name: 'Bright Future School',
        slug: 'bright-future',
        logo: 'https://cdn.example.com/logo.png',
        status: SCHOOL_STATUS.ACTIVE,
      });

      assert.equal(config.email, undefined);
      assert.equal(config.passwordHash, undefined);
      assert.equal(config.jwtSecret, undefined);
      assert.equal(config._id, undefined);
    } finally {
      School.findOne = originalFindOne;
    }
  });
});
