import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import authorize from '../../src/middlewares/authorize.js';
import requirePermission from '../../src/middlewares/requirePermission.js';
import sanitizeBody from '../../src/middlewares/sanitizeFields.js';
import { enforceTenant, requireSchoolMembership, buildTenantQuery } from '../../src/middlewares/tenantIsolation.js';
import {
  ROLES,
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PROTECTED_FIELDS,
  PERMISSION_SET,
} from '../../src/constants/index.js';

/**
 * Helper: run middleware and capture error
 */
function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    const res = {};
    middleware(req, res, (err) => {
      resolve(err || null);
    });
  });
}

describe('Phase 4 — RBAC Security & Multi-Tenancy Governance Tests', () => {
  // ─── 1. Student cannot access School Admin operations ───
  it('should deny STUDENT access to School Admin operations (schools:create)', async () => {
    const mw = requirePermission(PERMISSIONS.SCHOOLS_CREATE);
    const err = await runMiddleware(mw, {
      user: { id: 's1', role: ROLES.STUDENT, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.STUDENT },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
    assert.ok(err.message.includes('schools:create'));
  });

  it('should deny STUDENT access to user management (users:create)', async () => {
    const mw = requirePermission(PERMISSIONS.USERS_CREATE);
    const err = await runMiddleware(mw, {
      user: { id: 's1', role: ROLES.STUDENT, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.STUDENT },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 2. Teacher cannot access Super Admin operations ───
  it('should deny TEACHER access to Super Admin operations (schools:manage)', async () => {
    const mw = requirePermission(PERMISSIONS.SCHOOLS_MANAGE);
    const err = await runMiddleware(mw, {
      user: { id: 't1', role: ROLES.TEACHER, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.TEACHER },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  it('should deny TEACHER access to subscriptions:manage', async () => {
    const mw = requirePermission(PERMISSIONS.SUBSCRIPTIONS_MANAGE);
    const err = await runMiddleware(mw, {
      user: { id: 't1', role: ROLES.TEACHER, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.TEACHER },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 3. School Admin cannot create Super Admin ───
  it('should deny SCHOOL_ADMIN from granting SUPER_ADMIN role via authorize', async () => {
    const mw = authorize(ROLES.SUPER_ADMIN);
    const err = await runMiddleware(mw, {
      user: { id: 'sa1', role: ROLES.SCHOOL_ADMIN, schoolId: 'school-1' },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
    assert.ok(err.message.includes("Role 'SCHOOL_ADMIN' is not authorized"));
  });

  // ─── 4. School Admin cannot access another school ───
  it('should deny SCHOOL_ADMIN access to another school via requireSchoolMembership', async () => {
    const mw = requireSchoolMembership('schoolId');
    const err = await runMiddleware(mw, {
      user: { id: 'sa1', role: ROLES.SCHOOL_ADMIN, schoolId: 'school-1' },
      params: { schoolId: 'school-2' },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 5. Teacher cannot access another school ───
  it('should deny TEACHER access to another school via enforceTenant', async () => {
    const req = {
      user: { id: 't1', role: ROLES.TEACHER, schoolId: 'school-1' },
      body: { schoolId: 'school-2' },
      query: { schoolId: 'school-2' },
    };
    const err = await runMiddleware(enforceTenant, req);
    assert.equal(err, null);
    // Body and query schoolId overridden to user's school
    assert.equal(req.body.schoolId, 'school-1');
    assert.equal(req.query.schoolId, 'school-1');
    assert.equal(req.tenantId, 'school-1');
  });

  // ─── 6. Student cannot access another student's data (tenant query) ───
  it('should scope student queries to their own school via buildTenantQuery', () => {
    const req = {
      user: { id: 's1', role: ROLES.STUDENT, schoolId: 'school-1' },
    };
    const query = buildTenantQuery(req, { role: ROLES.STUDENT });
    assert.equal(query.schoolId, 'school-1');
    assert.equal(query.role, ROLES.STUDENT);
  });

  // ─── 7. Parent cannot access another parent's child (tenant boundary) ───
  it('should scope parent queries to their own school via buildTenantQuery', () => {
    const req = {
      user: { id: 'p1', role: ROLES.PARENT, schoolId: 'school-1' },
    };
    const query = buildTenantQuery(req, { parentId: 'p1' });
    assert.equal(query.schoolId, 'school-1');
    assert.equal(query.parentId, 'p1');
  });

  // ─── 8. Accountant cannot modify academic results ───
  it('should deny ACCOUNTANT access to results:create permission', async () => {
    const mw = requirePermission(PERMISSIONS.RESULTS_CREATE);
    const err = await runMiddleware(mw, {
      user: { id: 'a1', role: ROLES.ACCOUNTANT, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.ACCOUNTANT },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
    assert.ok(err.message.includes('results:create'));
  });

  it('should deny ACCOUNTANT access to results:update permission', async () => {
    const mw = requirePermission(PERMISSIONS.RESULTS_UPDATE);
    const err = await runMiddleware(mw, {
      user: { id: 'a1', role: ROLES.ACCOUNTANT, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.ACCOUNTANT },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 9. Librarian cannot manage fees ───
  it('should deny LIBRARIAN access to fees:manage permission', async () => {
    const mw = requirePermission(PERMISSIONS.FEES_MANAGE);
    const err = await runMiddleware(mw, {
      user: { id: 'l1', role: ROLES.LIBRARIAN, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.LIBRARIAN },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
    assert.ok(err.message.includes('fees:manage'));
  });

  it('should deny LIBRARIAN access to fees:create permission', async () => {
    const mw = requirePermission(PERMISSIONS.FEES_CREATE);
    const err = await runMiddleware(mw, {
      user: { id: 'l1', role: ROLES.LIBRARIAN, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.LIBRARIAN },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 10. Staff cannot access unassigned permissions ───
  it('should deny STAFF access to unassigned permissions (library:create)', async () => {
    const mw = requirePermission(PERMISSIONS.LIBRARY_CREATE);
    const err = await runMiddleware(mw, {
      user: { id: 'st1', role: ROLES.STAFF, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.STAFF },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 11. User cannot modify their own role (sanitizeBody) ───
  it('should strip role from req.body via sanitizeBody', async () => {
    const mw = sanitizeBody(...PROTECTED_FIELDS);
    const req = {
      body: {
        firstName: 'Eve',
        role: 'SUPER_ADMIN',
        schoolId: 'evil-school',
        permissions: ['schools:delete'],
        status: 'ACTIVE',
      },
    };
    const err = await runMiddleware(mw, req);
    assert.equal(err, null);
    assert.equal(req.body.firstName, 'Eve');
    assert.equal(req.body.role, undefined);
    assert.equal(req.body.permissions, undefined);
    assert.equal(req.body.status, undefined);
  });

  // ─── 12. User cannot modify their own schoolId (sanitizeBody) ───
  it('should strip schoolId from req.body via sanitizeBody', async () => {
    const mw = sanitizeBody(...PROTECTED_FIELDS);
    const req = {
      body: { firstName: 'Eve', schoolId: 'other-school-id' },
    };
    const err = await runMiddleware(mw, req);
    assert.equal(err, null);
    assert.equal(req.body.schoolId, undefined);
    assert.equal(req.body.firstName, 'Eve');
  });

  // ─── 13. Frontend-supplied schoolId cannot bypass tenant isolation ───
  it('should override frontend-supplied schoolId in body via enforceTenant', async () => {
    const req = {
      user: { id: '1', role: ROLES.STUDENT, schoolId: 'school-real' },
      body: { schoolId: 'school-evil' },
      query: { schoolId: 'school-evil' },
    };
    const err = await runMiddleware(enforceTenant, req);
    assert.equal(err, null);
    assert.equal(req.body.schoolId, 'school-real');
    assert.equal(req.query.schoolId, 'school-real');
  });

  // ─── 14. Permission escalation fails ───
  it('should deny permission escalation — TEACHER cannot get schools:delete', async () => {
    const mw = requirePermission(PERMISSIONS.SCHOOLS_DELETE);
    const err = await runMiddleware(mw, {
      user: { id: 't1', role: ROLES.TEACHER, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.TEACHER },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  it('should deny permission escalation — PARENT cannot get users:delete', async () => {
    const mw = requirePermission(PERMISSIONS.USERS_DELETE);
    const err = await runMiddleware(mw, {
      user: { id: 'p1', role: ROLES.PARENT, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.PARENT },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });

  // ─── 15. Invalid permission string ───
  it('should deny access for invalid/nonexistent permission string', async () => {
    const mw = requirePermission('nonexistent:fake');
    const err = await runMiddleware(mw, {
      user: { id: 't1', role: ROLES.TEACHER, schoolId: 'school-1', permissions: DEFAULT_ROLE_PERMISSIONS.TEACHER },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
    assert.ok(err.message.includes('nonexistent:fake'));
  });

  // ─── 16. SUPER_ADMIN retains platform access ───
  it('should allow SUPER_ADMIN full platform access via requirePermission', async () => {
    const mw = requirePermission(PERMISSIONS.SCHOOLS_MANAGE, PERMISSIONS.SUBSCRIPTIONS_MANAGE, PERMISSIONS.AI_MANAGE);
    const err = await runMiddleware(mw, {
      user: { id: 'sa1', role: ROLES.SUPER_ADMIN, schoolId: null, permissions: [] },
    });
    assert.equal(err, null);
  });

  it('should allow SUPER_ADMIN full platform access via authorize', async () => {
    const mw = authorize(ROLES.SUPER_ADMIN);
    const err = await runMiddleware(mw, {
      user: { id: 'sa1', role: ROLES.SUPER_ADMIN, schoolId: null },
    });
    assert.equal(err, null);
  });

  // ─── 17. Permissions constants integrity ───
  it('should have all PERMISSION_VALUES accessible via PERMISSION_SET for O(1) lookups', () => {
    assert.ok(PERMISSION_SET instanceof Set);
    assert.ok(PERMISSION_SET.has(PERMISSIONS.SCHOOLS_READ));
    assert.ok(PERMISSION_SET.has(PERMISSIONS.AI_MANAGE));
    assert.ok(PERMISSION_SET.has(PERMISSIONS.SUBSCRIPTIONS_MANAGE));
    assert.ok(!PERMISSION_SET.has('fake:permission'));
  });

  it('should define default permissions for every role', () => {
    for (const role of Object.values(ROLES)) {
      assert.ok(
        Array.isArray(DEFAULT_ROLE_PERMISSIONS[role]),
        `Missing DEFAULT_ROLE_PERMISSIONS for role: ${role}`
      );
    }
  });

  it('should ensure SUPER_ADMIN has all permissions', () => {
    const superPerms = new Set(DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN);
    for (const perm of Object.values(PERMISSIONS)) {
      assert.ok(superPerms.has(perm), `SUPER_ADMIN missing permission: ${perm}`);
    }
  });

  it('should ensure SCHOOL_ADMIN does NOT have schools:create or schools:delete', () => {
    const adminPerms = new Set(DEFAULT_ROLE_PERMISSIONS.SCHOOL_ADMIN);
    assert.ok(!adminPerms.has(PERMISSIONS.SCHOOLS_CREATE));
    assert.ok(!adminPerms.has(PERMISSIONS.SCHOOLS_DELETE));
  });

  it('should ensure SCHOOL_ADMIN does NOT have subscriptions:manage', () => {
    const adminPerms = new Set(DEFAULT_ROLE_PERMISSIONS.SCHOOL_ADMIN);
    assert.ok(!adminPerms.has(PERMISSIONS.SUBSCRIPTIONS_MANAGE));
  });

  // ─── 18. PROTECTED_FIELDS completeness ───
  it('should include critical fields in PROTECTED_FIELDS', () => {
    assert.ok(PROTECTED_FIELDS.includes('role'));
    assert.ok(PROTECTED_FIELDS.includes('schoolId'));
    assert.ok(PROTECTED_FIELDS.includes('permissions'));
    assert.ok(PROTECTED_FIELDS.includes('status'));
    assert.ok(PROTECTED_FIELDS.includes('isDeleted'));
    assert.ok(PROTECTED_FIELDS.includes('createdBy'));
    assert.ok(PROTECTED_FIELDS.includes('passwordHash'));
    assert.ok(PROTECTED_FIELDS.includes('_id'));
  });

  // ─── 19. Custom permissions merge correctly ───
  it('should allow custom permissions to grant access beyond role defaults', async () => {
    // STAFF normally cannot create fees; give custom permission
    const mw = requirePermission(PERMISSIONS.FEES_CREATE);
    const err = await runMiddleware(mw, {
      user: {
        id: 'st1',
        role: ROLES.STAFF,
        schoolId: 'school-1',
        permissions: [...DEFAULT_ROLE_PERMISSIONS.STAFF, PERMISSIONS.FEES_CREATE],
      },
    });
    assert.equal(err, null);
  });

  // ─── 20. Backward compatibility — authorize still works ───
  it('should maintain backward compatibility of authorize(...roles)', async () => {
    const mw = authorize(ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN);
    const err = await runMiddleware(mw, {
      user: { id: '1', role: ROLES.SCHOOL_ADMIN, schoolId: 'school-1' },
    });
    assert.equal(err, null);
  });

  it('should maintain backward deny behavior of authorize(...roles)', async () => {
    const mw = authorize(ROLES.SUPER_ADMIN);
    const err = await runMiddleware(mw, {
      user: { id: '1', role: ROLES.TEACHER, schoolId: 'school-1' },
    });
    assert.ok(err);
    assert.equal(err.statusCode, 403);
  });
});
