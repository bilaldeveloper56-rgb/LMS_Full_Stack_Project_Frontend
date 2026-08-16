import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTenantFolder } from '../../src/modules/uploads/upload.controller.js';
import { ROLES } from '../../src/constants/index.js';

describe('Upload Middleware & Controller Unit Tests', () => {
  it('should resolve tenant folder with schoolId for school-level users', () => {
    const schoolUser = {
      _id: '507f1f77bcf86cd799439011',
      role: ROLES.TEACHER,
      schoolId: '507f1f77bcf86cd799439099',
    };

    const folder = resolveTenantFolder(schoolUser, 'avatars');
    assert.equal(folder, 'school_erp/507f1f77bcf86cd799439099/avatars');
  });

  it('should resolve platform folder for SUPER_ADMIN users with null schoolId', () => {
    const superAdmin = {
      _id: '507f1f77bcf86cd799439000',
      role: ROLES.SUPER_ADMIN,
      schoolId: null,
    };

    const folder = resolveTenantFolder(superAdmin, 'documents');
    assert.equal(folder, 'school_erp/platform/documents');
  });

  it('should fallback to platform folder when user or schoolId is undefined', () => {
    const folder = resolveTenantFolder(null, 'general');
    assert.equal(folder, 'school_erp/platform/general');
  });
});
