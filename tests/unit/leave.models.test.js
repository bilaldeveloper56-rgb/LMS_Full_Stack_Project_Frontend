import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Leave from '../../src/modules/leaves/leave.model.js';
import {
  LEAVE_STATUS,
  LEAVE_TYPE,
  LEAVE_DAY_TYPE,
} from '../../src/constants/index.js';

describe('Leave Model Unit Tests', () => {
  it('should instantiate leave record with valid fields and defaults', () => {
    const leave = new Leave({
      schoolId: '507f1f77bcf86cd799439011',
      applicantUserId: '507f1f77bcf86cd799439022',
      studentId: '507f1f77bcf86cd799439033',
      leaveType: LEAVE_TYPE.SICK,
      dayType: LEAVE_DAY_TYPE.FULL_DAY,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-03'),
      reason: 'Medical recovery for fever',
    });

    assert.equal(leave.leaveType, LEAVE_TYPE.SICK);
    assert.equal(leave.dayType, LEAVE_DAY_TYPE.FULL_DAY);
    assert.equal(leave.status, LEAVE_STATUS.PENDING);
    assert.equal(leave.isDeleted, false);
    assert.equal(leave.approvedBy, null);
    assert.equal(leave.rejectedBy, null);
  });

  it('should support half-day leave and optional attachmentUrl', () => {
    const leave = new Leave({
      schoolId: '507f1f77bcf86cd799439011',
      applicantUserId: '507f1f77bcf86cd799439022',
      leaveType: LEAVE_TYPE.EMERGENCY,
      dayType: LEAVE_DAY_TYPE.HALF_DAY,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-01'),
      reason: 'Family emergency in the morning',
      attachmentUrl: 'https://cdn.school.edu/docs/emergency.pdf',
    });

    assert.equal(leave.dayType, LEAVE_DAY_TYPE.HALF_DAY);
    assert.equal(leave.attachmentUrl, 'https://cdn.school.edu/docs/emergency.pdf');
  });

  it('should store cancellation timestamp', () => {
    const cancelledAt = new Date();
    const leave = new Leave({
      schoolId: '507f1f77bcf86cd799439011',
      applicantUserId: '507f1f77bcf86cd799439022',
      leaveType: LEAVE_TYPE.CASUAL,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-01'),
      reason: 'Plan cancelled',
      status: LEAVE_STATUS.CANCELLED,
      cancelledAt,
    });

    assert.equal(leave.status, LEAVE_STATUS.CANCELLED);
    assert.equal(leave.cancelledAt.getTime(), cancelledAt.getTime());
  });

  it('should reject invalid leave type', () => {
    const leave = new Leave({
      schoolId: '507f1f77bcf86cd799439011',
      applicantUserId: '507f1f77bcf86cd799439022',
      leaveType: 'VACATION',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-03'),
      reason: 'Holiday',
    });

    const err = leave.validateSync();
    assert.ok(err);
    assert.ok(err.errors.leaveType);
  });

  it('should reject invalid leave status', () => {
    const leave = new Leave({
      schoolId: '507f1f77bcf86cd799439011',
      applicantUserId: '507f1f77bcf86cd799439022',
      leaveType: LEAVE_TYPE.CASUAL,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-03'),
      reason: 'Family event',
      status: 'INVALID_STATUS',
    });

    const err = leave.validateSync();
    assert.ok(err);
    assert.ok(err.errors.status);
  });

  it('should require mandatory fields: schoolId, applicantUserId, leaveType, startDate, endDate, reason', () => {
    const leave = new Leave({});
    const err = leave.validateSync();
    assert.ok(err);
    assert.ok(err.errors.schoolId);
    assert.ok(err.errors.applicantUserId);
    assert.ok(err.errors.leaveType);
    assert.ok(err.errors.startDate);
    assert.ok(err.errors.endDate);
    assert.ok(err.errors.reason);
  });

  it('should strip internal isDeleted and __v in toJSON', () => {
    const leave = new Leave({
      schoolId: '507f1f77bcf86cd799439011',
      applicantUserId: '507f1f77bcf86cd799439022',
      leaveType: LEAVE_TYPE.SICK,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-03'),
      reason: 'Sick',
    });

    const json = leave.toJSON();
    assert.equal(json.isDeleted, undefined);
    assert.equal(json.__v, undefined);
  });
});
