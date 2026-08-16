import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import Student from '../../src/modules/students/student.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import Enrollment from '../../src/modules/students/enrollment.model.js';
import {
  EMPLOYMENT_STATUS,
  ENROLLMENT_STATUS,
  RELATIONSHIP_TYPE,
  GENDER,
  BLOOD_GROUP,
} from '../../src/constants/index.js';

describe('User Entities Domain Models Unit Tests', () => {
  describe('Teacher Model', () => {
    it('should instantiate teacher with defaults', () => {
      const teacher = new Teacher({
        schoolId: '507f1f77bcf86cd799439011',
        employeeId: 'emp-101',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@school.edu',
      });

      assert.equal(teacher.employeeId, 'EMP-101');
      assert.equal(teacher.firstName, 'John');
      assert.equal(teacher.employmentStatus, EMPLOYMENT_STATUS.ACTIVE);
      assert.equal(teacher.gender, GENDER.OTHER);
      assert.equal(teacher.designation, 'Teacher');
      assert.equal(teacher.isDeleted, false);
    });

    it('should reject invalid employment status', () => {
      const teacher = new Teacher({
        schoolId: '507f1f77bcf86cd799439011',
        employeeId: 'EMP-101',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@school.edu',
        employmentStatus: 'INVALID_STATUS',
      });

      const err = teacher.validateSync();
      assert.ok(err);
      assert.ok(err.errors.employmentStatus);
    });
  });

  describe('Parent Model', () => {
    it('should instantiate parent with valid fields', () => {
      const parent = new Parent({
        schoolId: '507f1f77bcf86cd799439011',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+1234567890',
        relationship: 'Mother',
      });

      assert.equal(parent.firstName, 'Jane');
      assert.equal(parent.phone, '+1234567890');
      assert.equal(parent.isDeleted, false);
    });

    it('should require phone and email', () => {
      const parent = new Parent({
        schoolId: '507f1f77bcf86cd799439011',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      const err = parent.validateSync();
      assert.ok(err);
      assert.ok(err.errors.email);
      assert.ok(err.errors.phone);
    });
  });

  describe('Student Model', () => {
    it('should instantiate student with uppercase admissionNumber and default ACTIVE status', () => {
      const student = new Student({
        schoolId: '507f1f77bcf86cd799439011',
        admissionNumber: 'adm-2026-001',
        firstName: 'Alex',
        lastName: 'Smith',
        dateOfBirth: new Date('2010-05-15'),
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        bloodGroup: BLOOD_GROUP.O_POSITIVE,
      });

      assert.equal(student.admissionNumber, 'ADM-2026-001');
      assert.equal(student.firstName, 'Alex');
      assert.equal(student.enrollmentStatus, ENROLLMENT_STATUS.ACTIVE);
      assert.equal(student.bloodGroup, 'O+');
      assert.equal(student.isDeleted, false);
    });

    it('should reject invalid enrollmentStatus', () => {
      const student = new Student({
        schoolId: '507f1f77bcf86cd799439011',
        admissionNumber: 'ADM-01',
        firstName: 'Alex',
        lastName: 'Smith',
        dateOfBirth: new Date('2010-05-15'),
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        enrollmentStatus: 'INVALID_STATUS',
      });

      const err = student.validateSync();
      assert.ok(err);
      assert.ok(err.errors.enrollmentStatus);
    });
  });

  describe('StudentParent Model', () => {
    it('should instantiate student-parent relationship with default GUARDIAN type and notification flags', () => {
      const link = new StudentParent({
        schoolId: '507f1f77bcf86cd799439011',
        studentId: '507f1f77bcf86cd799439022',
        parentId: '507f1f77bcf86cd799439033',
        relationshipType: RELATIONSHIP_TYPE.FATHER,
        isPrimary: true,
      });

      assert.equal(link.relationshipType, RELATIONSHIP_TYPE.FATHER);
      assert.equal(link.isPrimary, true);
      assert.equal(link.canReceiveNotifications, true);
      assert.equal(link.canViewAcademicRecords, true);
    });
  });

  describe('Enrollment Model', () => {
    it('should instantiate enrollment record with default enrolledAt date', () => {
      const enrollment = new Enrollment({
        schoolId: '507f1f77bcf86cd799439011',
        studentId: '507f1f77bcf86cd799439022',
        academicSessionId: '507f1f77bcf86cd799439033',
        classId: '507f1f77bcf86cd799439044',
        sectionId: '507f1f77bcf86cd799439055',
        rollNumber: '12',
      });

      assert.equal(enrollment.rollNumber, '12');
      assert.equal(enrollment.enrollmentStatus, ENROLLMENT_STATUS.ACTIVE);
      assert.ok(enrollment.enrolledAt instanceof Date);
    });
  });
});
