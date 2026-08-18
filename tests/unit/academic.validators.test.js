import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAcademicSessionSchema,
  updateAcademicSessionSchema,
  changeSessionStatusSchema,
  queryAcademicSessionsSchema,
} from '../../src/modules/academics/academicSession.validator.js';
import {
  createClassSchema,
  updateClassSchema,
  queryClassesSchema,
} from '../../src/modules/academics/class.validator.js';
import {
  createSectionSchema,
  updateSectionSchema,
  querySectionsSchema,
} from '../../src/modules/academics/section.validator.js';
import {
  createSubjectSchema,
  updateSubjectSchema,
  querySubjectsSchema,
} from '../../src/modules/academics/subject.validator.js';
import {
  createTeacherAssignmentSchema,
  updateTeacherAssignmentSchema,
  queryTeacherAssignmentsSchema,
} from '../../src/modules/academics/teacherAssignment.validator.js';
import {
  createTeacherSchema,
  updateTeacherSchema,
  queryTeachersSchema,
} from '../../src/modules/teachers/teacher.validator.js';
import {
  createParentSchema,
  updateParentSchema,
  queryParentsSchema,
} from '../../src/modules/parents/parent.validator.js';
import {
  createStudentSchema,
  updateStudentSchema,
  queryStudentsSchema,
} from '../../src/modules/students/student.validator.js';
import {
  createEnrollmentSchema,
  updateEnrollmentSchema,
  queryEnrollmentsSchema,
} from '../../src/modules/students/enrollment.validator.js';
import {
  createStudentParentSchema,
  updateStudentParentSchema,
  queryStudentParentsSchema,
} from '../../src/modules/parents/studentParent.validator.js';

describe('Academic Domain Validators Unit Tests', () => {
  describe('AcademicSession Validator', () => {
    it('should accept valid session payload', () => {
      const payload = {
        name: '2026-2027',
        startDate: '2026-08-01',
        endDate: '2027-05-31',
        status: 'ACTIVE',
        isCurrent: true,
      };
      const result = createAcademicSessionSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should reject session where startDate >= endDate', () => {
      const payload = {
        name: '2026-2027',
        startDate: '2027-08-01',
        endDate: '2026-05-31',
      };
      const result = createAcademicSessionSchema.safeParse(payload);
      assert.equal(result.success, false);
      assert.ok(result.error.errors.some((e) => e.message.includes('before end date')));
    });

    it('should validate update academic session schema', () => {
      const payload = { name: '2026-2027 Revised', isCurrent: true };
      const result = updateAcademicSessionSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate change session status schema', () => {
      const result = changeSessionStatusSchema.safeParse({ status: 'COMPLETED' });
      assert.equal(result.success, true);

      const invalidResult = changeSessionStatusSchema.safeParse({ status: 'INVALID' });
      assert.equal(invalidResult.success, false);
    });

    it('should validate query academic sessions schema with defaults', () => {
      const result = queryAcademicSessionsSchema.safeParse({});
      assert.equal(result.success, true);
      assert.equal(result.data.page, 1);
      assert.equal(result.data.limit, 10);
      assert.equal(result.data.sortBy, 'createdAt');
    });
  });

  describe('Class Validator', () => {
    it('should validate valid class creation payload', () => {
      const payload = {
        name: 'Grade 10',
        code: 'G10',
        academicSessionId: '507f1f77bcf86cd799439011',
        displayOrder: 10,
      };
      const result = createClassSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should reject class with invalid academicSessionId format', () => {
      const payload = {
        name: 'Grade 10',
        code: 'G10',
        academicSessionId: 'invalid-id',
      };
      const result = createClassSchema.safeParse(payload);
      assert.equal(result.success, false);
    });

    it('should validate update class schema', () => {
      const result = updateClassSchema.safeParse({ name: 'Grade 10 Advanced', displayOrder: 1 });
      assert.equal(result.success, true);
    });

    it('should validate query classes schema', () => {
      const result = queryClassesSchema.safeParse({ isActive: 'true', page: '2', limit: '20' });
      assert.equal(result.success, true);
      assert.equal(result.data.isActive, true);
      assert.equal(result.data.page, 2);
    });
  });

  describe('Section Validator', () => {
    it('should validate valid section payload', () => {
      const payload = {
        name: 'Section A',
        code: 'A',
        classId: '507f1f77bcf86cd799439011',
        capacity: 35,
        room: 'Room 101',
      };
      const result = createSectionSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should reject negative section capacity', () => {
      const payload = {
        name: 'Section A',
        code: 'A',
        classId: '507f1f77bcf86cd799439011',
        capacity: -5,
      };
      const result = createSectionSchema.safeParse(payload);
      assert.equal(result.success, false);
    });

    it('should validate update section schema', () => {
      const result = updateSectionSchema.safeParse({ capacity: 45, room: 'Room 202' });
      assert.equal(result.success, true);
    });

    it('should validate query sections schema', () => {
      const result = querySectionsSchema.safeParse({ classId: '507f1f77bcf86cd799439011' });
      assert.equal(result.success, true);
    });
  });

  describe('Subject Validator', () => {
    it('should validate valid subject payload', () => {
      const payload = {
        name: 'Physics',
        code: 'PHY-101',
        subjectType: 'CORE',
        isOptional: false,
      };
      const result = createSubjectSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate update subject schema', () => {
      const result = updateSubjectSchema.safeParse({ isOptional: true, subjectType: 'ELECTIVE' });
      assert.equal(result.success, true);
    });

    it('should validate query subjects schema', () => {
      const result = querySubjectsSchema.safeParse({ subjectType: 'CORE', isOptional: 'false' });
      assert.equal(result.success, true);
      assert.equal(result.data.isOptional, false);
    });
  });

  describe('TeacherAssignment Validator', () => {
    it('should validate valid teacher assignment payload', () => {
      const payload = {
        academicSessionId: '507f1f77bcf86cd799439011',
        teacherId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        subjectId: '507f1f77bcf86cd799439055',
      };
      const result = createTeacherAssignmentSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate update teacher assignment schema', () => {
      const result = updateTeacherAssignmentSchema.safeParse({
        teacherId: '507f1f77bcf86cd799439099',
      });
      assert.equal(result.success, true);
    });

    it('should validate query teacher assignments schema', () => {
      const result = queryTeacherAssignmentsSchema.safeParse({
        teacherId: '507f1f77bcf86cd799439022',
      });
      assert.equal(result.success, true);
    });
  });

  describe('Teacher Validator', () => {
    it('should validate valid teacher payload', () => {
      const payload = {
        employeeId: 'EMP-001',
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'robert.brown@school.edu',
        phone: '+1234567890',
        gender: 'MALE',
        designation: 'Senior Teacher',
      };
      const result = createTeacherSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate teacher payload with empty optional strings from form', () => {
      const payload = {
        employeeId: 'EMP-002',
        firstName: 'Alan',
        lastName: 'Turing',
        email: 'alan.turing@school.edu',
        phone: '',
        dateOfBirth: '',
        gender: 'OTHER',
        qualification: '',
        specialization: '',
        joiningDate: '2026-08-18',
        designation: 'Teacher',
        profileImage: '',
        employmentStatus: 'ACTIVE',
        userId: '',
      };
      const result = createTeacherSchema.safeParse(payload);
      assert.equal(result.success, true);
      assert.equal(result.data.dateOfBirth, null);
      assert.equal(result.data.profileImage, null);
      assert.equal(result.data.userId, null);
    });

    it('should reject teacher with invalid email', () => {
      const payload = {
        employeeId: 'EMP-001',
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'not-an-email',
      };
      const result = createTeacherSchema.safeParse(payload);
      assert.equal(result.success, false);
    });

    it('should validate update teacher schema', () => {
      const result = updateTeacherSchema.safeParse({
        designation: 'Department Head',
        employmentStatus: 'ON_LEAVE',
      });
      assert.equal(result.success, true);
    });

    it('should validate query teachers schema', () => {
      const result = queryTeachersSchema.safeParse({ employmentStatus: 'ACTIVE', gender: 'MALE' });
      assert.equal(result.success, true);
    });
  });

  describe('Parent Validator', () => {
    it('should validate valid parent payload', () => {
      const payload = {
        firstName: 'Mary',
        lastName: 'Watson',
        email: 'mary.watson@example.com',
        phone: '+1987654321',
        relationship: 'Mother',
      };
      const result = createParentSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate update parent schema', () => {
      const result = updateParentSchema.safeParse({ occupation: 'Architect' });
      assert.equal(result.success, true);
    });

    it('should validate query parents schema', () => {
      const result = queryParentsSchema.safeParse({ search: 'Watson' });
      assert.equal(result.success, true);
    });
  });

  describe('Student & Enrollment Validators', () => {
    it('should validate valid student creation payload', () => {
      const payload = {
        admissionNumber: 'ADM-2026-001',
        firstName: 'Emma',
        lastName: 'Watson',
        dateOfBirth: '2012-04-15',
        gender: 'FEMALE',
        academicSessionId: '507f1f77bcf86cd799439011',
        classId: '507f1f77bcf86cd799439022',
        sectionId: '507f1f77bcf86cd799439033',
        rollNumber: '05',
      };
      const result = createStudentSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate student creation payload with empty optional strings from form', () => {
      const payload = {
        admissionNumber: 'ADM-2026-002',
        firstName: 'Ada',
        lastName: 'Lovelace',
        dateOfBirth: '2012-04-15',
        gender: 'FEMALE',
        academicSessionId: '507f1f77bcf86cd799439011',
        classId: '507f1f77bcf86cd799439022',
        sectionId: '507f1f77bcf86cd799439033',
        rollNumber: '',
        admissionDate: '2026-08-18',
        enrollmentStatus: 'ACTIVE',
        bloodGroup: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        profileImage: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        userId: '',
      };
      const result = createStudentSchema.safeParse(payload);
      assert.equal(result.success, true);
      assert.equal(result.data.profileImage, null);
      assert.equal(result.data.email, null);
      assert.equal(result.data.bloodGroup, null);
      assert.equal(result.data.userId, null);
    });

    it('should validate update student schema', () => {
      const result = updateStudentSchema.safeParse({
        firstName: 'Emilia',
        enrollmentStatus: 'GRADUATED',
      });
      assert.equal(result.success, true);
    });

    it('should validate query students schema', () => {
      const result = queryStudentsSchema.safeParse({
        classId: '507f1f77bcf86cd799439022',
        enrollmentStatus: 'ACTIVE',
      });
      assert.equal(result.success, true);
    });

    it('should validate student-parent link payload', () => {
      const payload = {
        studentId: '507f1f77bcf86cd799439011',
        parentId: '507f1f77bcf86cd799439022',
        relationshipType: 'MOTHER',
        isPrimary: true,
      };
      const result = createStudentParentSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate update student-parent link schema', () => {
      const result = updateStudentParentSchema.safeParse({
        isPrimary: false,
        canReceiveNotifications: false,
      });
      assert.equal(result.success, true);
    });

    it('should validate query student-parent links schema', () => {
      const result = queryStudentParentsSchema.safeParse({
        studentId: '507f1f77bcf86cd799439011',
      });
      assert.equal(result.success, true);
    });

    it('should validate enrollment creation payload', () => {
      const payload = {
        studentId: '507f1f77bcf86cd799439011',
        academicSessionId: '507f1f77bcf86cd799439022',
        classId: '507f1f77bcf86cd799439033',
        sectionId: '507f1f77bcf86cd799439044',
        rollNumber: '15',
      };
      const result = createEnrollmentSchema.safeParse(payload);
      assert.equal(result.success, true);
    });

    it('should validate update enrollment schema', () => {
      const result = updateEnrollmentSchema.safeParse({
        rollNumber: '18',
        enrollmentStatus: 'GRADUATED',
      });
      assert.equal(result.success, true);
    });

    it('should validate query enrollments schema', () => {
      const result = queryEnrollmentsSchema.safeParse({
        academicSessionId: '507f1f77bcf86cd799439022',
      });
      assert.equal(result.success, true);
    });
  });
});
