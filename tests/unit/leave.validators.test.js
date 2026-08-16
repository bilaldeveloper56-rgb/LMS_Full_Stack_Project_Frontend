import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createLeaveSchema,
  updateLeaveSchema,
  rejectLeaveSchema,
  queryLeavesSchema,
} from '../../src/modules/leaves/leave.validator.js';

describe('Leave Validator Unit Tests', () => {
  describe('createLeaveSchema', () => {
    it('should validate valid leave creation payload', () => {
      const payload = {
        leaveType: 'SICK',
        dayType: 'FULL_DAY',
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        reason: 'Flu symptoms',
      };
      const result = createLeaveSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate creation payload with teacherId and attachmentUrl', () => {
      const payload = {
        teacherId: '507f1f77bcf86cd799439011',
        leaveType: 'MATERNITY',
        dayType: 'FULL_DAY',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
        reason: 'Maternity leave for newborn child',
        attachmentUrl: 'https://example.com/docs/certificate.pdf',
      };
      const result = createLeaveSchema.safeParse(payload);
      assert.equal(result.success, true);
      assert.equal(result.data.leaveType, 'MATERNITY');
    });

    it('should validate all valid leave types', () => {
      const types = ['SICK', 'CASUAL', 'EMERGENCY', 'MATERNITY', 'PATERNITY', 'MEDICAL', 'OTHER'];
      for (const t of types) {
        const res = createLeaveSchema.safeParse({
          leaveType: t,
          startDate: '2026-09-01',
          endDate: '2026-09-01',
          reason: `Valid reason for ${t}`,
        });
        assert.equal(res.success, true);
      }
    });

    it('should reject leave where startDate is after endDate', () => {
      const payload = {
        leaveType: 'SICK',
        dayType: 'FULL_DAY',
        startDate: '2026-09-05',
        endDate: '2026-09-01',
        reason: 'Invalid date range',
      };
      const result = createLeaveSchema.safeParse(payload);
      assert.equal(result.success, false);
      assert.ok(result.error.errors.some((e) => e.message.includes('before or equal to end date')));
    });

    it('should reject invalid leaveType', () => {
      const payload = {
        leaveType: 'UNKNOWN_TYPE',
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        reason: 'Personal reason',
      };
      const result = createLeaveSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe('updateLeaveSchema', () => {
    it('should validate valid update payload', () => {
      const payload = {
        reason: 'Updated reason for medical appointment',
        dayType: 'HALF_DAY',
      };
      const result = updateLeaveSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should reject update with invalid date sequence', () => {
      const payload = {
        startDate: '2026-09-10',
        endDate: '2026-09-05',
      };
      const result = updateLeaveSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe('rejectLeaveSchema', () => {
    it('should validate valid rejection payload with reason', () => {
      const payload = {
        rejectionReason: 'Exams scheduled on these dates',
      };
      const result = rejectLeaveSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should reject rejection missing reason', () => {
      const payload = {};
      const result = rejectLeaveSchema.safeParse(payload);
      assert.equal(result.success, false);
    });

    it('should reject rejectionReason shorter than 3 characters', () => {
      const payload = { rejectionReason: 'no' };
      const result = rejectLeaveSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe('queryLeavesSchema', () => {
    it('should validate query parameters with defaults', () => {
      const result = queryLeavesSchema.safeParse({ status: 'PENDING', page: '1', limit: '10' });
      assert.equal(result.success, true);
      assert.equal(result.data.status, 'PENDING');
      assert.equal(result.data.page, 1);
    });

    it('should validate query parameters with applicantUserId and leaveType', () => {
      const result = queryLeavesSchema.safeParse({
        applicantUserId: '507f1f77bcf86cd799439011',
        leaveType: 'MEDICAL',
        dayType: 'HALF_DAY',
      });
      assert.equal(result.success, true);
      assert.equal(result.data.leaveType, 'MEDICAL');
    });
  });
});
