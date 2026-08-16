import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Attendance from '../../src/modules/attendance/attendance.model.js';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_SOURCE,
} from '../../src/constants/index.js';

describe('Attendance Model Unit Tests', () => {
  it('should instantiate attendance record with valid fields and defaults', () => {
    const attendance = new Attendance({
      schoolId: '507f1f77bcf86cd799439011',
      academicSessionId: '507f1f77bcf86cd799439022',
      studentId: '507f1f77bcf86cd799439033',
      classId: '507f1f77bcf86cd799439044',
      sectionId: '507f1f77bcf86cd799439055',
      date: new Date('2026-09-01'),
      status: ATTENDANCE_STATUS.PRESENT,
      source: ATTENDANCE_SOURCE.MANUAL,
    });

    assert.equal(attendance.status, ATTENDANCE_STATUS.PRESENT);
    assert.equal(attendance.source, ATTENDANCE_SOURCE.MANUAL);
    assert.equal(attendance.isDeleted, false);
    assert.equal(attendance.remarks, null);
    assert.equal(attendance.correctedBy, null);
  });

  it('should support timestamps and checkIn/checkOut fields', () => {
    const checkIn = new Date('2026-09-01T08:00:00Z');
    const checkOut = new Date('2026-09-01T15:00:00Z');
    const attendance = new Attendance({
      schoolId: '507f1f77bcf86cd799439011',
      academicSessionId: '507f1f77bcf86cd799439022',
      studentId: '507f1f77bcf86cd799439033',
      classId: '507f1f77bcf86cd799439044',
      sectionId: '507f1f77bcf86cd799439055',
      date: new Date('2026-09-01'),
      checkInTime: checkIn,
      checkOutTime: checkOut,
    });

    assert.equal(attendance.checkInTime.getTime(), checkIn.getTime());
    assert.equal(attendance.checkOutTime.getTime(), checkOut.getTime());
  });

  it('should store correction fields properly', () => {
    const correctedAt = new Date();
    const attendance = new Attendance({
      schoolId: '507f1f77bcf86cd799439011',
      academicSessionId: '507f1f77bcf86cd799439022',
      studentId: '507f1f77bcf86cd799439033',
      classId: '507f1f77bcf86cd799439044',
      sectionId: '507f1f77bcf86cd799439055',
      date: new Date('2026-09-01'),
      correctedBy: '507f1f77bcf86cd799439066',
      correctedAt,
      correctionReason: 'Wrong roll number marked initially',
    });

    assert.equal(attendance.correctedBy.toString(), '507f1f77bcf86cd799439066');
    assert.equal(attendance.correctionReason, 'Wrong roll number marked initially');
  });

  it('should reject invalid attendance status', () => {
    const attendance = new Attendance({
      schoolId: '507f1f77bcf86cd799439011',
      academicSessionId: '507f1f77bcf86cd799439022',
      studentId: '507f1f77bcf86cd799439033',
      classId: '507f1f77bcf86cd799439044',
      sectionId: '507f1f77bcf86cd799439055',
      date: new Date('2026-09-01'),
      status: 'INVALID_STATUS',
    });

    const err = attendance.validateSync();
    assert.ok(err);
    assert.ok(err.errors.status);
  });

  it('should reject invalid attendance source', () => {
    const attendance = new Attendance({
      schoolId: '507f1f77bcf86cd799439011',
      academicSessionId: '507f1f77bcf86cd799439022',
      studentId: '507f1f77bcf86cd799439033',
      classId: '507f1f77bcf86cd799439044',
      sectionId: '507f1f77bcf86cd799439055',
      date: new Date('2026-09-01'),
      source: 'INVALID_SOURCE',
    });

    const err = attendance.validateSync();
    assert.ok(err);
    assert.ok(err.errors.source);
  });

  it('should require mandatory fields: schoolId, session, student, class, section, date', () => {
    const attendance = new Attendance({});
    const err = attendance.validateSync();
    assert.ok(err);
    assert.ok(err.errors.schoolId);
    assert.ok(err.errors.academicSessionId);
    assert.ok(err.errors.studentId);
    assert.ok(err.errors.classId);
    assert.ok(err.errors.sectionId);
    assert.ok(err.errors.date);
  });

  it('should strip internal isDeleted and __v in toJSON', () => {
    const attendance = new Attendance({
      schoolId: '507f1f77bcf86cd799439011',
      academicSessionId: '507f1f77bcf86cd799439022',
      studentId: '507f1f77bcf86cd799439033',
      classId: '507f1f77bcf86cd799439044',
      sectionId: '507f1f77bcf86cd799439055',
      date: new Date('2026-09-01'),
    });

    const json = attendance.toJSON();
    assert.equal(json.isDeleted, undefined);
    assert.equal(json.__v, undefined);
  });
});
