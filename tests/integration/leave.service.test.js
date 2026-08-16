import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Leave from '../../src/modules/leaves/leave.model.js';
import Student from '../../src/modules/students/student.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import School from '../../src/modules/schools/school.model.js';
import * as leaveService from '../../src/modules/leaves/leave.service.js';
import { ROLES, LEAVE_STATUS, LEAVE_TYPE } from '../../src/constants/index.js';

describe('Leave Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const studentUserId = '507f1f77bcf86cd799439022';
  const studentProfileId = '507f1f77bcf86cd799439033';
  const teacherUserId = '507f1f77bcf86cd799439044';
  const teacherProfileId = '507f1f77bcf86cd799439055';
  const adminUserId = '507f1f77bcf86cd799439066';

  const studentUser = { id: studentUserId, role: ROLES.STUDENT, schoolId };
  const teacherUser = { id: teacherUserId, role: ROLES.TEACHER, schoolId };
  const adminUser = { id: adminUserId, role: ROLES.SCHOOL_ADMIN, schoolId };

  describe('createLeave', () => {
    it('should automatically associate applicant studentId when created by student', async () => {
      const origSchoolFindById = School.findById;
      const origStudentFindOne = Student.findOne;
      const origLeaveSave = Leave.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Student.findOne = () => Promise.resolve({ _id: studentProfileId, userId: studentUserId, schoolId });
      Leave.prototype.save = function () {
        this._id = '507f1f77bcf86cd799439099';
        return Promise.resolve(this);
      };

      const result = await leaveService.createLeave(
        {
          leaveType: LEAVE_TYPE.SICK,
          startDate: '2026-09-01',
          endDate: '2026-09-03',
          reason: 'High fever',
        },
        studentUser
      );

      School.findById = origSchoolFindById;
      Student.findOne = origStudentFindOne;
      Leave.prototype.save = origLeaveSave;

      assert.equal(result.applicantUserId.toString(), studentUserId);
      assert.equal(result.studentId.toString(), studentProfileId);
      assert.equal(result.status, LEAVE_STATUS.PENDING);
    });

    it('should automatically associate applicant teacherId when created by teacher', async () => {
      const origSchoolFindById = School.findById;
      const origTeacherFindOne = Teacher.findOne;
      const origLeaveSave = Leave.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Teacher.findOne = () => Promise.resolve({ _id: teacherProfileId, userId: teacherUserId, schoolId });
      Leave.prototype.save = function () {
        this._id = '507f1f77bcf86cd799439099';
        return Promise.resolve(this);
      };

      const result = await leaveService.createLeave(
        {
          leaveType: LEAVE_TYPE.CASUAL,
          startDate: '2026-09-10',
          endDate: '2026-09-11',
          reason: 'Family wedding',
        },
        teacherUser
      );

      School.findById = origSchoolFindById;
      Teacher.findOne = origTeacherFindOne;
      Leave.prototype.save = origLeaveSave;

      assert.equal(result.applicantUserId.toString(), teacherUserId);
      assert.equal(result.teacherId.toString(), teacherProfileId);
      assert.equal(result.status, LEAVE_STATUS.PENDING);
    });
  });

  describe('updateLeave & deleteLeave', () => {
    it('should update pending leave request when invoked by applicant', async () => {
      const origLeaveFindOne = Leave.findOne;
      const mockLeave = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        applicantUserId: studentUserId,
        status: LEAVE_STATUS.PENDING,
        reason: 'Initial reason',
        save: () => Promise.resolve(mockLeave),
        toJSON: () => ({
          id: '507f1f77bcf86cd799439099',
          status: mockLeave.status,
          reason: mockLeave.reason,
        }),
      };

      Leave.findOne = () => Promise.resolve(mockLeave);

      const result = await leaveService.updateLeave(
        '507f1f77bcf86cd799439099',
        { reason: 'Updated reason for medical leave' },
        studentUser
      );

      Leave.findOne = origLeaveFindOne;

      assert.equal(result.reason, 'Updated reason for medical leave');
    });

    it('should reject update if user is not applicant or admin', async () => {
      const origLeaveFindOne = Leave.findOne;
      const mockLeave = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        applicantUserId: studentUserId,
        status: LEAVE_STATUS.PENDING,
      };

      Leave.findOne = () => Promise.resolve(mockLeave);

      await assert.rejects(
        () =>
          leaveService.updateLeave(
            '507f1f77bcf86cd799439099',
            { reason: 'Unauthorized edit' },
            teacherUser
          ),
        (err) => err.statusCode === 403
      );

      Leave.findOne = origLeaveFindOne;
    });

    it('should soft delete leave request', async () => {
      const origLeaveFindOne = Leave.findOne;
      const mockLeave = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        applicantUserId: studentUserId,
        isDeleted: false,
        save: () => Promise.resolve(mockLeave),
      };

      Leave.findOne = () => Promise.resolve(mockLeave);

      const result = await leaveService.deleteLeave('507f1f77bcf86cd799439099', adminUser);

      Leave.findOne = origLeaveFindOne;

      assert.equal(result.success, true);
      assert.equal(mockRecord(mockLeave).isDeleted, true);
    });
  });

  describe('approveLeave', () => {
    it('should approve a pending leave request when approved by admin', async () => {
      const origLeaveFindOne = Leave.findOne;
      const mockLeave = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        applicantUserId: studentUserId,
        studentId: studentProfileId,
        status: LEAVE_STATUS.PENDING,
        save: () => Promise.resolve(mockLeave),
        toJSON: () => ({
          id: '507f1f77bcf86cd799439099',
          status: mockLeave.status,
          approvedBy: mockLeave.approvedBy,
        }),
      };

      Leave.findOne = () => Promise.resolve(mockLeave);

      const result = await leaveService.approveLeave('507f1f77bcf86cd799439099', adminUser);

      Leave.findOne = origLeaveFindOne;

      assert.equal(result.status, LEAVE_STATUS.APPROVED);
      assert.equal(result.approvedBy, adminUserId);
    });

    it('should reject approval if applicant attempts to self-approve', async () => {
      const origLeaveFindOne = Leave.findOne;
      const mockLeave = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        applicantUserId: teacherUserId,
        teacherId: teacherProfileId,
        status: LEAVE_STATUS.PENDING,
      };

      Leave.findOne = () => Promise.resolve(mockLeave);

      await assert.rejects(
        () => leaveService.approveLeave('507f1f77bcf86cd799439099', teacherUser),
        (err) => err.statusCode === 403 && err.message.includes('cannot approve their own')
      );

      Leave.findOne = origLeaveFindOne;
    });

    it('should reject approval if leave status is already approved or rejected', async () => {
      const origLeaveFindOne = Leave.findOne;
      const mockLeave = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        applicantUserId: studentUserId,
        status: LEAVE_STATUS.APPROVED,
      };

      Leave.findOne = () => Promise.resolve(mockLeave);

      await assert.rejects(
        () => leaveService.approveLeave('507f1f77bcf86cd799439099', adminUser),
        (err) => err.statusCode === 400 && err.message.includes('Only pending')
      );

      Leave.findOne = origLeaveFindOne;
    });
  });

  describe('rejectLeave', () => {
    it('should reject a pending leave with a valid rejection reason', async () => {
      const origLeaveFindOne = Leave.findOne;
      const mockLeave = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        applicantUserId: studentUserId,
        status: LEAVE_STATUS.PENDING,
        save: () => Promise.resolve(mockLeave),
        toJSON: () => ({
          id: '507f1f77bcf86cd799439099',
          status: mockLeave.status,
          rejectedBy: mockLeave.rejectedBy,
          rejectionReason: mockLeave.rejectionReason,
        }),
      };

      Leave.findOne = () => Promise.resolve(mockLeave);

      const result = await leaveService.rejectLeave(
        '507f1f77bcf86cd799439099',
        { rejectionReason: 'Mid-term exams scheduled' },
        adminUser
      );

      Leave.findOne = origLeaveFindOne;

      assert.equal(result.status, LEAVE_STATUS.REJECTED);
      assert.equal(result.rejectionReason, 'Mid-term exams scheduled');
      assert.equal(result.rejectedBy, adminUserId);
    });
  });

  describe('cancelLeave', () => {
    it('should allow applicant to cancel their own pending leave request', async () => {
      const origLeaveFindOne = Leave.findOne;
      const mockLeave = {
        _id: '507f1f77bcf86cd799439099',
        schoolId,
        applicantUserId: studentUserId,
        status: LEAVE_STATUS.PENDING,
        save: () => Promise.resolve(mockLeave),
        toJSON: () => ({
          id: '507f1f77bcf86cd799439099',
          status: mockLeave.status,
        }),
      };

      Leave.findOne = () => Promise.resolve(mockLeave);

      const result = await leaveService.cancelLeave('507f1f77bcf86cd799439099', studentUser);

      Leave.findOne = origLeaveFindOne;

      assert.equal(result.status, LEAVE_STATUS.CANCELLED);
    });
  });

  describe('Scoped Leave Queries', () => {
    it('should retrieve my leaves scoped to current user', async () => {
      const origLeaveFind = Leave.find;
      const origLeaveCount = Leave.countDocuments;

      const mockQuery = {
        populate: () => mockQuery,
        sort: () => mockQuery,
        skip: () => mockQuery,
        limit: () => Promise.resolve([
          {
            _id: '507f1f77bcf86cd799439099',
            applicantUserId: studentUserId,
            leaveType: 'SICK',
            toJSON: () => ({ id: '507f1f77bcf86cd799439099', leaveType: 'SICK' }),
          },
        ]),
      };

      Leave.find = () => mockQuery;
      Leave.countDocuments = () => Promise.resolve(1);

      const result = await leaveService.getMyLeaves({}, studentUser);

      Leave.find = origLeaveFind;
      Leave.countDocuments = origLeaveCount;

      assert.equal(result.leaves.length, 1);
      assert.equal(result.leaves[0].leaveType, 'SICK');
    });

    it('should retrieve student leaves', async () => {
      const origLeaveFind = Leave.find;
      const origLeaveCount = Leave.countDocuments;

      const mockQuery = {
        populate: () => mockQuery,
        sort: () => mockQuery,
        skip: () => mockQuery,
        limit: () => Promise.resolve([]),
      };

      Leave.find = () => mockQuery;
      Leave.countDocuments = () => Promise.resolve(0);

      const result = await leaveService.getStudentLeaves(studentProfileId, {}, adminUser);

      Leave.find = origLeaveFind;
      Leave.countDocuments = origLeaveCount;

      assert.equal(result.leaves.length, 0);
    });

    it('should retrieve teacher leaves', async () => {
      const origLeaveFind = Leave.find;
      const origLeaveCount = Leave.countDocuments;

      const mockQuery = {
        populate: () => mockQuery,
        sort: () => mockQuery,
        skip: () => mockQuery,
        limit: () => Promise.resolve([]),
      };

      Leave.find = () => mockQuery;
      Leave.countDocuments = () => Promise.resolve(0);

      const result = await leaveService.getTeacherLeaves(teacherProfileId, {}, adminUser);

      Leave.find = origLeaveFind;
      Leave.countDocuments = origLeaveCount;

      assert.equal(result.leaves.length, 0);
    });
  });
});

function mockRecord(doc) {
  return doc;
}
