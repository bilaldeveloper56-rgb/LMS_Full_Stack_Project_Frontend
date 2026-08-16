import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  correctAttendanceSchema,
  bulkAttendanceSchema,
  queryAttendanceSchema,
  queryAttendanceReportSchema,
} from '../../src/modules/attendance/attendance.validator.js';

describe('Attendance Validator Unit Tests', () => {
  describe('createAttendanceSchema', () => {
    it('should validate valid attendance creation payload', () => {
      const payload = {
        studentId: '507f1f77bcf86cd799439011',
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        date: '2026-09-01',
        status: 'PRESENT',
        remarks: 'On time',
      };
      const result = createAttendanceSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate creation payload with check-in and check-out times', () => {
      const payload = {
        studentId: '507f1f77bcf86cd799439011',
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        date: '2026-09-01',
        status: 'PRESENT',
        checkInTime: '2026-09-01T08:00:00Z',
        checkOutTime: '2026-09-01T15:00:00Z',
        source: 'CARD',
      };
      const result = createAttendanceSchema.safeParse(payload);
      assert.equal(result.success, true);
      assert.equal(result.data.source, 'CARD');
    });

    it('should reject invalid studentId format', () => {
      const payload = {
        studentId: 'invalid-id',
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        date: '2026-09-01',
        status: 'PRESENT',
      };
      const result = createAttendanceSchema.safeParse(payload);
      assert.equal(result.success, false);
    });

    it('should reject invalid attendance status', () => {
      const payload = {
        studentId: '507f1f77bcf86cd799439011',
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        date: '2026-09-01',
        status: 'NON_EXISTENT_STATUS',
      };
      const result = createAttendanceSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe('updateAttendanceSchema', () => {
    it('should validate valid update payload', () => {
      const payload = {
        status: 'LATE',
        remarks: 'Bus was delayed',
      };
      const result = updateAttendanceSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate update payload with timestamps and source', () => {
      const payload = {
        checkInTime: '2026-09-01T08:30:00Z',
        checkOutTime: '2026-09-01T15:00:00Z',
        source: 'MANUAL',
      };
      const result = updateAttendanceSchema.safeParse(payload);
      assert.equal(result.success, true);
    });
  });

  describe('correctAttendanceSchema', () => {
    it('should validate valid correction payload', () => {
      const payload = {
        status: 'EXCUSED',
        correctionReason: 'Medical slip submitted later by parent',
      };
      const result = correctAttendanceSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should reject correction missing correctionReason', () => {
      const payload = {
        status: 'EXCUSED',
      };
      const result = correctAttendanceSchema.safeParse(payload);
      assert.equal(result.success, false);
    });

    it('should reject correctionReason that is too short (< 3 chars)', () => {
      const payload = {
        status: 'EXCUSED',
        correctionReason: 'ab',
      };
      const result = correctAttendanceSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe('bulkAttendanceSchema', () => {
    it('should validate valid bulk attendance payload', () => {
      const payload = {
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        date: '2026-09-01',
        records: [
          { studentId: '507f1f77bcf86cd799439011', status: 'PRESENT' },
          { studentId: '507f1f77bcf86cd799439012', status: 'ABSENT', remarks: 'Unwell' },
        ],
      };
      const result = bulkAttendanceSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should reject empty records array', () => {
      const payload = {
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        date: '2026-09-01',
        records: [],
      };
      const result = bulkAttendanceSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe('queryAttendanceSchema & queryAttendanceReportSchema', () => {
    it('should validate query parameters with defaults', () => {
      const result = queryAttendanceSchema.safeParse({ page: '2', limit: '25' });
      assert.equal(result.success, true);
      assert.equal(result.data.page, 2);
      assert.equal(result.data.limit, 25);
    });

    it('should validate query parameters with status and source filters', () => {
      const result = queryAttendanceSchema.safeParse({
        status: 'LATE',
        source: 'CARD',
        date: '2026-09-01',
      });
      assert.equal(result.success, true);
      assert.equal(result.data.status, 'LATE');
    });

    it('should validate report query with date ranges', () => {
      const result = queryAttendanceReportSchema.safeParse({
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        classId: '507f1f77bcf86cd799439033',
      });
      assert.equal(result.success, true);
    });
  });
});
