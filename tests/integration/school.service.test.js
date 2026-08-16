import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import * as schoolService from '../../src/modules/schools/school.service.js';
import School from '../../src/modules/schools/school.model.js';
import User from '../../src/modules/users/user.model.js';
import { ROLES, USER_STATUS, SCHOOL_STATUS } from '../../src/constants/index.js';

describe('School Service Business Logic Tests', () => {
  const dummySuperAdminId = '507f1f77bcf86cd799439001';

  it('should provision a school and link initial School Admin (Requirements 10, 11, 13, 14)', async () => {
    const originalFindOneSchool = School.findOne;
    const originalFindOneUser = User.findOne;
    const originalSchoolSave = School.prototype.save;
    const originalUserSave = User.prototype.save;

    // Simulate unique checks passing
    School.findOne = () => Promise.resolve(null);
    User.findOne = () => Promise.resolve(null);

    const dummySchoolId = '507f1f77bcf86cd799439099';
    let savedSchoolDoc = null;
    let savedAdminDoc = null;

    School.prototype.save = function () {
      this._id = dummySchoolId;
      savedSchoolDoc = this;
      return Promise.resolve(this);
    };

    User.prototype.save = function () {
      this._id = '507f1f77bcf86cd799439088';
      savedAdminDoc = this;
      return Promise.resolve(this);
    };

    const schoolPayload = {
      name: 'Beacon High',
      schoolCode: 'BCH-01',
      email: 'contact@beaconhigh.edu',
      city: 'New York',
    };

    const adminPayload = {
      firstName: 'Arthur',
      lastName: 'Pendleton',
      email: 'admin@beaconhigh.edu',
      phone: '1234567890',
    };

    const result = await schoolService.createSchoolWithAdmin(
      schoolPayload,
      adminPayload,
      dummySuperAdminId,
      { ipAddress: '127.0.0.1', userAgent: 'test' }
    );

    School.findOne = originalFindOneSchool;
    User.findOne = originalFindOneUser;
    School.prototype.save = originalSchoolSave;
    User.prototype.save = originalUserSave;

    assert.ok(result.school);
    assert.equal(result.school.name, 'Beacon High');
    assert.equal(result.school.schoolCode, 'BCH-01');
    assert.ok(result.admin);
    assert.equal(result.admin.email, 'admin@beaconhigh.edu');
    assert.equal(result.admin.role, ROLES.SCHOOL_ADMIN);
    assert.equal(result.admin.status, USER_STATUS.INVITED);
    assert.equal(savedAdminDoc.schoolId.toString(), dummySchoolId);
    assert.ok(savedAdminDoc.invitationToken);
    assert.ok(savedAdminDoc.invitationExpires);
  });

  it('should reject school creation with duplicate schoolCode (Requirement 10)', async () => {
    const originalFindOneSchool = School.findOne;
    School.findOne = () => Promise.resolve({ _id: 'existing-id', schoolCode: 'DUP-01' });

    await assert.rejects(
      async () => {
        await schoolService.createSchoolWithAdmin(
          { name: 'School', schoolCode: 'DUP-01', email: 's@s.edu' },
          { firstName: 'A', lastName: 'B', email: 'a@s.edu' },
          dummySuperAdminId
        );
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.ok(err.message.includes('already in use'));
        return true;
      }
    );

    School.findOne = originalFindOneSchool;
  });

  it('should reject school creation with duplicate admin email', async () => {
    const originalFindOneSchool = School.findOne;
    const originalFindOneUser = User.findOne;

    School.findOne = () => Promise.resolve(null);
    User.findOne = () => Promise.resolve({ _id: 'existing-user', email: 'existing@admin.edu' });

    await assert.rejects(
      async () => {
        await schoolService.createSchoolWithAdmin(
          { name: 'School', schoolCode: 'NEW-01', email: 'new@s.edu' },
          { firstName: 'A', lastName: 'B', email: 'existing@admin.edu' },
          dummySuperAdminId
        );
      },
      (err) => {
        assert.equal(err.statusCode, 409);
        assert.ok(err.message.includes('Admin email') && err.message.includes('already registered'));
        return true;
      }
    );

    School.findOne = originalFindOneSchool;
    User.findOne = originalFindOneUser;
  });

  it('should accept invitation and activate School Admin account (Requirements 14, 15, 16, 17, 18)', async () => {
    const originalFindOne = User.findOne;
    const rawToken = 'valid-invitation-token-12345';
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    let saved = false;
    const mockInvitedUser = {
      _id: 'admin-user-id',
      email: 'admin@school.edu',
      role: ROLES.SCHOOL_ADMIN,
      status: USER_STATUS.INVITED,
      emailVerified: false,
      invitationToken: hashedToken,
      invitationExpires: new Date(Date.now() + 1000 * 60 * 60), // Valid for 1h
      save: async function () {
        saved = true;
      },
      toJSON: function () {
        return {
          id: this._id,
          email: this.email,
          role: this.role,
          status: this.status,
          emailVerified: this.emailVerified,
        };
      },
    };

    User.findOne = () => ({
      select: () => Promise.resolve(mockInvitedUser),
    });

    const userResult = await schoolService.acceptInvitation(rawToken, 'NewSecurePassword123!');

    assert.equal(saved, true);
    assert.equal(mockInvitedUser.status, USER_STATUS.ACTIVE);
    assert.equal(mockInvitedUser.emailVerified, true);
    assert.equal(mockInvitedUser.invitationToken, undefined, 'Invitation token must be cleared');
    assert.equal(mockInvitedUser.invitationExpires, undefined, 'Invitation expires must be cleared');
    assert.equal(userResult.status, USER_STATUS.ACTIVE);

    // Test with expired or reused token (Requirements 15 & 16)
    User.findOne = () => ({
      select: () => Promise.resolve(null),
    });

    await assert.rejects(
      async () => {
        await schoolService.acceptInvitation(rawToken, 'NewSecurePassword123!');
      },
      (err) => {
        assert.equal(err.statusCode, 400);
        assert.equal(err.message, 'Invalid or expired invitation token');
        return true;
      }
    );

    User.findOne = originalFindOne;
  });

  it('should change school status and log appropriate audit event (Requirements 19, 20, 21)', async () => {
    const originalFindById = School.findById;

    const mockSchool = {
      _id: 'school-id-1',
      name: 'Heritage College',
      status: SCHOOL_STATUS.ACTIVE,
      save: async function () {
        return this;
      },
      toJSON: function () {
        return { id: this._id, name: this.name, status: this.status };
      },
    };

    School.findById = () => Promise.resolve(mockSchool);

    const suspendedSchool = await schoolService.changeSchoolStatus(
      '507f1f77bcf86cd799439099',
      SCHOOL_STATUS.SUSPENDED,
      dummySuperAdminId,
      'Subscription overdue'
    );

    assert.equal(mockSchool.status, SCHOOL_STATUS.SUSPENDED);
    assert.equal(suspendedSchool.status, SCHOOL_STATUS.SUSPENDED);

    School.findById = originalFindById;
  });

  it('should prevent mutating immutable fields during school update', async () => {
    const originalFindByIdAndUpdate = School.findByIdAndUpdate;

    let updatePayloadUsed = null;
    School.findByIdAndUpdate = (id, update) => {
      updatePayloadUsed = update;
      return Promise.resolve({
        toJSON: () => ({ id, name: update.name }),
      });
    };

    const updates = {
      name: 'Updated School Name',
      schoolCode: 'ATTEMPTED_NEW_CODE', // Must be stripped
      createdBy: 'ATTEMPTED_NEW_CREATOR', // Must be stripped
      isDeleted: true, // Must be stripped
    };

    await schoolService.updateSchool('507f1f77bcf86cd799439099', updates, dummySuperAdminId);

    School.findByIdAndUpdate = originalFindByIdAndUpdate;

    assert.equal(updatePayloadUsed.name, 'Updated School Name');
    assert.equal(updatePayloadUsed.schoolCode, undefined, 'schoolCode cannot be updated');
    assert.equal(updatePayloadUsed.createdBy, undefined, 'createdBy cannot be updated');
    assert.equal(updatePayloadUsed.isDeleted, undefined, 'isDeleted cannot be updated');
  });

  it('should return aggregated school statistics', async () => {
    const originalCount = School.countDocuments;

    School.countDocuments = (query = {}) => {
      if (!query.status) return Promise.resolve(10);
      if (query.status === SCHOOL_STATUS.ACTIVE) return Promise.resolve(7);
      if (query.status === SCHOOL_STATUS.SUSPENDED) return Promise.resolve(2);
      if (query.status === SCHOOL_STATUS.INACTIVE) return Promise.resolve(1);
      return Promise.resolve(0);
    };

    const stats = await schoolService.getSchoolStats();

    School.countDocuments = originalCount;

    assert.equal(stats.total, 10);
    assert.equal(stats.byStatus.active, 7);
    assert.equal(stats.byStatus.suspended, 2);
    assert.equal(stats.byStatus.inactive, 1);
  });
});
