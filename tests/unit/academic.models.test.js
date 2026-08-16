import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Subject from '../../src/modules/academics/subject.model.js';
import TeacherAssignment from '../../src/modules/academics/teacherAssignment.model.js';
import { SESSION_STATUS, SUBJECT_TYPE } from '../../src/constants/index.js';

describe('Academic Domain Models Unit Tests', () => {
  describe('AcademicSession Model', () => {
    it('should instantiate valid academic session', () => {
      const session = new AcademicSession({
        schoolId: '507f1f77bcf86cd799439011',
        name: '2026-2027',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-05-31'),
        status: SESSION_STATUS.UPCOMING,
        isCurrent: false,
      });

      assert.equal(session.name, '2026-2027');
      assert.equal(session.status, SESSION_STATUS.UPCOMING);
      assert.equal(session.isCurrent, false);
      assert.equal(session.isDeleted, false);
    });

    it('should reject invalid session status', () => {
      const session = new AcademicSession({
        schoolId: '507f1f77bcf86cd799439011',
        name: '2026-2027',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-05-31'),
        status: 'INVALID_STATUS',
      });

      const err = session.validateSync();
      assert.ok(err);
      assert.ok(err.errors.status);
    });

    it('should strip internal isDeleted flag in toJSON', () => {
      const session = new AcademicSession({
        schoolId: '507f1f77bcf86cd799439011',
        name: '2026-2027',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-05-31'),
      });

      const json = session.toJSON();
      assert.equal(json.isDeleted, undefined);
      assert.equal(json.__v, undefined);
    });
  });

  describe('Class Model', () => {
    it('should instantiate valid class with default displayOrder and uppercase code', () => {
      const cls = new Class({
        schoolId: '507f1f77bcf86cd799439011',
        academicSessionId: '507f1f77bcf86cd799439022',
        name: 'Class 10',
        code: 'cls-10',
      });

      assert.equal(cls.name, 'Class 10');
      assert.equal(cls.code, 'CLS-10');
      assert.equal(cls.displayOrder, 0);
      assert.equal(cls.isActive, true);
    });

    it('should require academicSessionId and schoolId', () => {
      const cls = new Class({ name: 'Class 1' });
      const err = cls.validateSync();
      assert.ok(err);
      assert.ok(err.errors.schoolId);
      assert.ok(err.errors.academicSessionId);
    });
  });

  describe('Section Model', () => {
    it('should instantiate section with default capacity 40 and uppercase code', () => {
      const section = new Section({
        schoolId: '507f1f77bcf86cd799439011',
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        name: 'Section A',
        code: 'a',
      });

      assert.equal(section.name, 'Section A');
      assert.equal(section.code, 'A');
      assert.equal(section.capacity, 40);
      assert.equal(section.isActive, true);
    });

    it('should reject zero or negative capacity', () => {
      const section = new Section({
        schoolId: '507f1f77bcf86cd799439011',
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        name: 'Section A',
        code: 'A',
        capacity: 0,
      });

      const err = section.validateSync();
      assert.ok(err);
      assert.ok(err.errors.capacity);
    });
  });

  describe('Subject Model', () => {
    it('should instantiate subject with default CORE type and uppercase code', () => {
      const subject = new Subject({
        schoolId: '507f1f77bcf86cd799439011',
        name: 'Mathematics',
        code: 'math-101',
      });

      assert.equal(subject.name, 'Mathematics');
      assert.equal(subject.code, 'MATH-101');
      assert.equal(subject.subjectType, SUBJECT_TYPE.CORE);
      assert.equal(subject.isOptional, false);
      assert.equal(subject.isActive, true);
    });

    it('should reject invalid subjectType', () => {
      const subject = new Subject({
        schoolId: '507f1f77bcf86cd799439011',
        name: 'Art',
        code: 'ART-01',
        subjectType: 'NON_EXISTENT',
      });

      const err = subject.validateSync();
      assert.ok(err);
      assert.ok(err.errors.subjectType);
    });
  });

  describe('TeacherAssignment Model', () => {
    it('should instantiate teacher assignment with required references', () => {
      const assignment = new TeacherAssignment({
        schoolId: '507f1f77bcf86cd799439011',
        academicSessionId: '507f1f77bcf86cd799439022',
        teacherId: '507f1f77bcf86cd799439033',
        classId: '507f1f77bcf86cd799439044',
        sectionId: '507f1f77bcf86cd799439055',
        subjectId: '507f1f77bcf86cd799439066',
      });

      assert.equal(assignment.schoolId.toString(), '507f1f77bcf86cd799439011');
      assert.equal(assignment.teacherId.toString(), '507f1f77bcf86cd799439033');
      assert.equal(assignment.subjectId.toString(), '507f1f77bcf86cd799439066');
    });
  });
});
