import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Subject from '../../src/modules/academics/subject.model.js';
import TeacherAssignment from '../../src/modules/academics/teacherAssignment.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import School from '../../src/modules/schools/school.model.js';
import * as sessionService from '../../src/modules/academics/academicSession.service.js';
import * as classService from '../../src/modules/academics/class.service.js';
import * as sectionService from '../../src/modules/academics/section.service.js';
import * as subjectService from '../../src/modules/academics/subject.service.js';
import * as assignmentService from '../../src/modules/academics/teacherAssignment.service.js';
import { ROLES, SESSION_STATUS, SUBJECT_TYPE } from '../../src/constants/index.js';

describe('Academic Domain Services Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const schoolAdminUser = { id: 'admin-1', role: ROLES.SCHOOL_ADMIN, schoolId };

  describe('Academic Session Service', () => {
    it('should create an academic session and enforce single current session rule', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;
      const origSessionUpdateMany = AcademicSession.updateMany;
      const origSessionSave = AcademicSession.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve(null);
      let updatedManyCalled = false;
      AcademicSession.updateMany = () => {
        updatedManyCalled = true;
        return Promise.resolve({ modifiedCount: 1 });
      };
      AcademicSession.prototype.save = function () {
        this._id = 'session-1';
        return Promise.resolve(this);
      };

      const session = await sessionService.createAcademicSession(
        {
          name: '2026-2027',
          startDate: '2026-08-01',
          endDate: '2027-05-31',
          status: SESSION_STATUS.ACTIVE,
          isCurrent: true,
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
      AcademicSession.updateMany = origSessionUpdateMany;
      AcademicSession.prototype.save = origSessionSave;

      assert.equal(session.name, '2026-2027');
      assert.equal(session.isCurrent, true);
      assert.equal(updatedManyCalled, true);
    });

    it('should transition previous active sessions to COMPLETED when activating a session', async () => {
      const origSessionFindOne = AcademicSession.findOne;
      const origSessionUpdateMany = AcademicSession.updateMany;
      const origSessionSave = AcademicSession.prototype.save;

      let updateManyFilter = null;
      let updateManyUpdate = null;
      AcademicSession.findOne = () =>
        Promise.resolve({
          _id: 'session-2',
          schoolId,
          status: SESSION_STATUS.UPCOMING,
          save: function () {
            return Promise.resolve(this);
          },
          toJSON: function () {
            return { ...this };
          },
        });
      AcademicSession.updateMany = (filter, update) => {
        updateManyFilter = filter;
        updateManyUpdate = update;
        return Promise.resolve({ modifiedCount: 1 });
      };

      const updated = await sessionService.changeSessionStatus('507f1f77bcf86cd799439022', SESSION_STATUS.ACTIVE, schoolAdminUser);

      AcademicSession.findOne = origSessionFindOne;
      AcademicSession.updateMany = origSessionUpdateMany;
      AcademicSession.prototype.save = origSessionSave;

      assert.equal(updated.status, SESSION_STATUS.ACTIVE);
      assert.equal(updated.isCurrent, true);
      assert.equal(updateManyUpdate.status, SESSION_STATUS.COMPLETED);
      assert.equal(updateManyUpdate.isCurrent, false);
    });

    it('should reject duplicate session name within the same school', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve({ _id: 'session-existing', name: '2026-2027' });

      await assert.rejects(
        () =>
          sessionService.createAcademicSession(
            {
              name: '2026-2027',
              startDate: '2026-08-01',
              endDate: '2027-05-31',
            },
            schoolAdminUser
          ),
        (err) => err.statusCode === 409 && err.message.includes('already exists')
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
    });
  });

  describe('Class Service', () => {
    it('should create class associated with academic session in the same school', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;
      const origClassFindOne = Class.findOne;
      const origClassSave = Class.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve({ _id: 'session-1', schoolId });
      Class.findOne = () => Promise.resolve(null);
      Class.prototype.save = function () {
        this._id = 'class-1';
        return Promise.resolve(this);
      };

      const cls = await classService.createClass(
        {
          name: 'Grade 10',
          code: 'G10',
          academicSessionId: 'session-1',
          displayOrder: 10,
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
      Class.findOne = origClassFindOne;
      Class.prototype.save = origClassSave;

      assert.equal(cls.name, 'Grade 10');
      assert.equal(cls.code, 'G10');
    });

    it('should reject class creation if academic session does not belong to school', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve(null); // Not found in this school

      await assert.rejects(
        () =>
          classService.createClass(
            {
              name: 'Grade 10',
              code: 'G10',
              academicSessionId: 'session-other-school',
            },
            schoolAdminUser
          ),
        (err) => err.statusCode === 404
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
    });
  });

  describe('Section Service', () => {
    it('should create section linked to class with valid teacher in same school', async () => {
      const origSchoolFindById = School.findById;
      const origClassFindOne = Class.findOne;
      const origSessionFindOne = AcademicSession.findOne;
      const origTeacherFindOne = Teacher.findOne;
      const origSectionFindOne = Section.findOne;
      const origSectionSave = Section.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Class.findOne = () => Promise.resolve({ _id: 'class-1', academicSessionId: 'session-1', schoolId });
      AcademicSession.findOne = () => Promise.resolve({ _id: 'session-1', schoolId });
      Teacher.findOne = () => Promise.resolve({ _id: 'teacher-1', schoolId });
      Section.findOne = () => Promise.resolve(null);
      Section.prototype.save = function () {
        this._id = 'section-1';
        return Promise.resolve(this);
      };

      const section = await sectionService.createSection(
        {
          name: 'Section A',
          code: 'A',
          classId: 'class-1',
          classTeacherId: 'teacher-1',
          capacity: 35,
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      Class.findOne = origClassFindOne;
      AcademicSession.findOne = origSessionFindOne;
      Teacher.findOne = origTeacherFindOne;
      Section.findOne = origSectionFindOne;
      Section.prototype.save = origSectionSave;

      assert.equal(section.name, 'Section A');
      assert.equal(section.code, 'A');
      assert.equal(section.capacity, 35);
    });
  });

  describe('Subject Service', () => {
    it('should create subject with unique code per school', async () => {
      const origSchoolFindById = School.findById;
      const origSubjectFindOne = Subject.findOne;
      const origSubjectSave = Subject.prototype.save;

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      Subject.findOne = () => Promise.resolve(null);
      Subject.prototype.save = function () {
        this._id = 'subject-1';
        return Promise.resolve(this);
      };

      const subject = await subjectService.createSubject(
        {
          name: 'Chemistry',
          code: 'CHEM-101',
          subjectType: SUBJECT_TYPE.CORE,
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      Subject.findOne = origSubjectFindOne;
      Subject.prototype.save = origSubjectSave;

      assert.equal(subject.name, 'Chemistry');
      assert.equal(subject.code, 'CHEM-101');
    });
  });

  describe('Teacher Assignment Service', () => {
    it('should create teacher assignment validating all referenced entities in the same school', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;
      const origTeacherFindOne = Teacher.findOne;
      const origClassFindOne = Class.findOne;
      const origSectionFindOne = Section.findOne;
      const origSubjectFindOne = Subject.findOne;
      const origAssignmentFindOne = TeacherAssignment.findOne;
      const origAssignmentSave = TeacherAssignment.prototype.save;

      const teacherId = '507f1f77bcf86cd799439033';
      const subjectId = '507f1f77bcf86cd799439066';
      const sessionId = '507f1f77bcf86cd799439022';
      const classId = '507f1f77bcf86cd799439044';
      const sectionId = '507f1f77bcf86cd799439055';

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
      Teacher.findOne = () => Promise.resolve({ _id: teacherId, schoolId });
      Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
      Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });
      Subject.findOne = () => Promise.resolve({ _id: subjectId, schoolId });
      TeacherAssignment.findOne = () => Promise.resolve(null);
      TeacherAssignment.prototype.save = function () {
        this._id = '507f1f77bcf86cd799439099';
        return Promise.resolve(this);
      };

      const assignment = await assignmentService.createTeacherAssignment(
        {
          academicSessionId: sessionId,
          teacherId,
          classId,
          sectionId,
          subjectId,
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
      Teacher.findOne = origTeacherFindOne;
      Class.findOne = origClassFindOne;
      Section.findOne = origSectionFindOne;
      Subject.findOne = origSubjectFindOne;
      TeacherAssignment.findOne = origAssignmentFindOne;
      TeacherAssignment.prototype.save = origAssignmentSave;

      assert.equal(assignment.teacherId.toString(), teacherId);
      assert.equal(assignment.subjectId.toString(), subjectId);
    });

    it('should assign teacher to multiple sections simultaneously', async () => {
      const origSchoolFindById = School.findById;
      const origSessionFindOne = AcademicSession.findOne;
      const origTeacherFindOne = Teacher.findOne;
      const origClassFindOne = Class.findOne;
      const origSectionFindOne = Section.findOne;
      const origSubjectFindOne = Subject.findOne;
      const origAssignmentFindOne = TeacherAssignment.findOne;
      const origAssignmentSave = TeacherAssignment.prototype.save;

      const teacherId = '507f1f77bcf86cd799439033';
      const subjectId = '507f1f77bcf86cd799439066';
      const sessionId = '507f1f77bcf86cd799439022';
      const classId = '507f1f77bcf86cd799439044';
      const sectionA = '507f1f77bcf86cd799439055';
      const sectionB = '507f1f77bcf86cd799439056';

      School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
      AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
      Teacher.findOne = () => Promise.resolve({ _id: teacherId, schoolId });
      Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
      Section.findOne = ({ _id }) => Promise.resolve({ _id, classId, schoolId });
      Subject.findOne = () => Promise.resolve({ _id: subjectId, schoolId });
      TeacherAssignment.findOne = () => Promise.resolve(null);
      let saveCount = 0;
      TeacherAssignment.prototype.save = function () {
        saveCount++;
        this._id = `assignment-${saveCount}`;
        return Promise.resolve(this);
      };

      const result = await assignmentService.createTeacherAssignment(
        {
          academicSessionId: sessionId,
          teacherId,
          classId,
          sectionIds: [sectionA, sectionB],
          subjectId,
        },
        schoolAdminUser
      );

      School.findById = origSchoolFindById;
      AcademicSession.findOne = origSessionFindOne;
      Teacher.findOne = origTeacherFindOne;
      Class.findOne = origClassFindOne;
      Section.findOne = origSectionFindOne;
      Subject.findOne = origSubjectFindOne;
      TeacherAssignment.findOne = origAssignmentFindOne;
      TeacherAssignment.prototype.save = origAssignmentSave;

      assert.equal(saveCount, 2);
      assert.equal(result.assignedSectionsCount, 2);
      assert.equal(result.assignments.length, 2);
    });
  });
});
