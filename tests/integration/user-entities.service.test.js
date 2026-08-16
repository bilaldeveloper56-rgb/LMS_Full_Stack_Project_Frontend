import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import Student from '../../src/modules/students/student.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import Enrollment from '../../src/modules/students/enrollment.model.js';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
import * as teacherService from '../../src/modules/teachers/teacher.service.js';
import * as parentService from '../../src/modules/parents/parent.service.js';
import * as studentService from '../../src/modules/students/student.service.js';
import * as studentParentService from '../../src/modules/parents/studentParent.service.js';
import * as enrollmentService from '../../src/modules/students/enrollment.service.js';
import { ROLES, RELATIONSHIP_TYPE, ENROLLMENT_STATUS } from '../../src/constants/index.js';

describe('User Entities Services Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const schoolAdminUser = { id: 'admin-1', role: ROLES.SCHOOL_ADMIN, schoolId };

  describe('Teacher Service', () => {
    it('should create teacher and link to user account with role TEACHER in same school', async () => {
      const origSchoolFindById = School.findById;
      const origTeacherFindOne = Teacher.findOne;
      const origUserFindOne = User.findOne;
      const origTeacherSave = Teacher.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Teacher.findOne = () => Promise.resolve(null);
      User.findOne = () => Promise.resolve({ _id: 'user-teacher-1', role: ROLES.TEACHER, schoolId });
      Teacher.prototype.save = function () {
        this._id = 'teacher-1';
        return Promise.resolve(this);
      };

      const teacher = await teacherService.createTeacher(
        {
          employeeId: 'EMP-201',
          firstName: 'Sarah',
          lastName: 'Connor',
          email: 'sarah.c@school.edu',
          userId: 'user-teacher-1',
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      Teacher.findOne = origTeacherFindOne;
      User.findOne = origUserFindOne;
      Teacher.prototype.save = origTeacherSave;

      assert.equal(teacher.employeeId, 'EMP-201');
      assert.equal(teacher.firstName, 'Sarah');
    });

    it('should reject teacher creation if linked user is not role TEACHER', async () => {
      const origSchoolFindById = School.findById;
      const origTeacherFindOne = Teacher.findOne;
      const origUserFindOne = User.findOne;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Teacher.findOne = () => Promise.resolve(null);
      User.findOne = () => Promise.resolve({ _id: 'user-student-1', role: ROLES.STUDENT, schoolId });

      await assert.rejects(
        () =>
          teacherService.createTeacher(
            {
              employeeId: 'EMP-202',
              firstName: 'Wrong',
              lastName: 'Role',
              email: 'wrong@school.edu',
              userId: 'user-student-1',
            },
            schoolAdminUser
          ),
        (err) => err.statusCode === 400 && err.message.includes('TEACHER')
      );

      School.findById = origSchoolFindById;
      Teacher.findOne = origTeacherFindOne;
      User.findOne = origUserFindOne;
    });
  });

  describe('Parent Service', () => {
    it('should create parent record within school', async () => {
      const origSchoolFindById = School.findById;
      const origParentSave = Parent.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Parent.prototype.save = function () {
        this._id = 'parent-1';
        return Promise.resolve(this);
      };

      const parent = await parentService.createParent(
        {
          firstName: 'Bruce',
          lastName: 'Wayne',
          email: 'bruce@wayne.com',
          phone: '+1555123456',
          relationship: 'Father',
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      Parent.prototype.save = origParentSave;

      assert.equal(parent.firstName, 'Bruce');
      assert.equal(parent.phone, '+1555123456');
    });
  });

  describe('Student Service & Auto-Enrollment', () => {
    it('should create student and automatically generate an initial enrollment record', async () => {
      const origSchoolFindById = School.findById;
      const origStudentFindOne = Student.findOne;
      const origSessionFindOne = AcademicSession.findOne;
      const origClassFindOne = Class.findOne;
      const origSectionFindOne = Section.findOne;
      const origStudentSave = Student.prototype.save;
      let enrollmentSaved = false;
      const origEnrollmentSave = Enrollment.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Student.findOne = () => Promise.resolve(null);
      AcademicSession.findOne = () => Promise.resolve({ _id: 'session-1', schoolId });
      Class.findOne = () => Promise.resolve({ _id: 'class-1', schoolId });
      Section.findOne = () => Promise.resolve({ _id: 'section-1', classId: 'class-1', schoolId });

      Student.prototype.save = function () {
        this._id = 'student-1';
        return Promise.resolve(this);
      };
      Enrollment.prototype.save = function () {
        enrollmentSaved = true;
        this._id = 'enrollment-1';
        return Promise.resolve(this);
      };

      const student = await studentService.createStudent(
        {
          admissionNumber: 'ADM-2026-999',
          firstName: 'Damian',
          lastName: 'Wayne',
          dateOfBirth: '2014-06-10',
          academicSessionId: 'session-1',
          classId: 'class-1',
          sectionId: 'section-1',
          rollNumber: '01',
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      Student.findOne = origStudentFindOne;
      AcademicSession.findOne = origSessionFindOne;
      Class.findOne = origClassFindOne;
      Section.findOne = origSectionFindOne;
      Student.prototype.save = origStudentSave;
      Enrollment.prototype.save = origEnrollmentSave;

      assert.equal(student.admissionNumber, 'ADM-2026-999');
      assert.equal(student.firstName, 'Damian');
      assert.equal(enrollmentSaved, true);
    });
  });

  describe('Student-Parent Link Service', () => {
    it('should link student and parent within the same school and handle isPrimary unsetting', async () => {
      const origSchoolFindById = School.findById;
      const origStudentFindOne = Student.findOne;
      const origParentFindOne = Parent.findOne;
      const origLinkFindOne = StudentParent.findOne;
      const origLinkUpdateMany = StudentParent.updateMany;
      const origLinkSave = StudentParent.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Student.findOne = () => Promise.resolve({ _id: 'student-1', schoolId });
      Parent.findOne = () => Promise.resolve({ _id: 'parent-1', schoolId });
      StudentParent.findOne = () => Promise.resolve(null);
      let updateManyCalled = false;
      StudentParent.updateMany = () => {
        updateManyCalled = true;
        return Promise.resolve({ modifiedCount: 1 });
      };
      StudentParent.prototype.save = function () {
        this._id = 'link-1';
        return Promise.resolve(this);
      };

      const link = await studentParentService.createStudentParentLink(
        {
          studentId: 'student-1',
          parentId: 'parent-1',
          relationshipType: RELATIONSHIP_TYPE.FATHER,
          isPrimary: true,
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      Student.findOne = origStudentFindOne;
      Parent.findOne = origParentFindOne;
      StudentParent.findOne = origLinkFindOne;
      StudentParent.updateMany = origLinkUpdateMany;
      StudentParent.prototype.save = origLinkSave;

      assert.equal(link.relationshipType, RELATIONSHIP_TYPE.FATHER);
      assert.equal(link.isPrimary, true);
      assert.equal(updateManyCalled, true);
    });
  });

  describe('Enrollment Service', () => {
    it('should create subsequent enrollment and update student class pointers', async () => {
      const origSchoolFindById = School.findById;
      const origStudentFindOne = Student.findOne;
      const origSessionFindOne = AcademicSession.findOne;
      const origClassFindOne = Class.findOne;
      const origSectionFindOne = Section.findOne;
      const origEnrollmentFindOne = Enrollment.findOne;
      const origEnrollmentSave = Enrollment.prototype.save;
      const origStudentSave = Student.prototype.save;

      const mockStudent = {
        _id: 'student-1',
        schoolId,
        save: () => Promise.resolve(mockStudent),
      };

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Student.findOne = () => Promise.resolve(mockStudent);
      AcademicSession.findOne = () => Promise.resolve({ _id: 'session-2', schoolId });
      Class.findOne = () => Promise.resolve({ _id: 'class-2', schoolId });
      Section.findOne = () => Promise.resolve({ _id: 'section-2', classId: 'class-2', schoolId });
      Enrollment.findOne = () => Promise.resolve(null);
      Enrollment.prototype.save = function () {
        this._id = 'enrollment-2';
        return Promise.resolve(this);
      };

      const enrollment = await enrollmentService.createEnrollment(
        {
          studentId: 'student-1',
          academicSessionId: 'session-2',
          classId: 'class-2',
          sectionId: 'section-2',
          rollNumber: '05',
          enrollmentStatus: ENROLLMENT_STATUS.ACTIVE,
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      Student.findOne = origStudentFindOne;
      AcademicSession.findOne = origSessionFindOne;
      Class.findOne = origClassFindOne;
      Section.findOne = origSectionFindOne;
      Enrollment.findOne = origEnrollmentFindOne;
      Enrollment.prototype.save = origEnrollmentSave;

      assert.equal(enrollment.rollNumber, '05');
      assert.equal(mockStudent.classId, 'class-2');
    });
  });
});
