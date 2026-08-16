import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  studentRosterQuerySchema,
  attendanceReportQuerySchema,
  feeDefaultersQuerySchema,
  academicReportCardQuerySchema,
} from '../../src/modules/reports/reports.validator.js';

describe('Reports Validators Unit Tests', () => {
  it('should accept valid student roster query with defaults', () => {
    const result = studentRosterQuerySchema.parse({});
    assert.equal(result.page, 1);
    assert.equal(result.limit, 50);
  });

  it('should accept valid attendance report query', () => {
    const result = attendanceReportQuerySchema.parse({
      classId: '507f1f77bcf86cd799439011',
      startDate: '2026-09-01',
      page: '2',
      limit: '25',
    });
    assert.equal(result.page, 2);
    assert.equal(result.limit, 25);
  });

  it('should accept valid fee defaulters query', () => {
    const result = feeDefaultersQuerySchema.parse({
      minBalance: '100',
    });
    assert.equal(result.minBalance, 100);
  });

  it('should require studentId for academic report card', () => {
    assert.throws(() => {
      academicReportCardQuerySchema.parse({});
    });
  });

  it('should pass academic report card query with studentId', () => {
    const result = academicReportCardQuerySchema.parse({
      studentId: '507f1f77bcf86cd799439011',
    });
    assert.equal(result.studentId, '507f1f77bcf86cd799439011');
  });
});
