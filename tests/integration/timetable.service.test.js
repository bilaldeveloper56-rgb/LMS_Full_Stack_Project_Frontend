import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Timetable from '../../src/modules/timetable/timetable.model.js';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Subject from '../../src/modules/academics/subject.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import Student from '../../src/modules/students/student.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import School from '../../src/modules/schools/school.model.js';
import * as timetableService from '../../src/modules/timetable/timetable.service.js';
import { ROLES, DAY_OF_WEEK } from '../../src/constants/index.js';

describe('Timetable Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439022';
  const classId = '507f1f77bcf86cd799439033';
  const sectionId = '507f1f77bcf86cd799439044';
  const subjectId = '507f1f77bcf86cd799439055';
  const teacherId = '507f1f77bcf86cd799439066';
  const adminUser = { id: 'admin-1', role: ROLES.SCHOOL_ADMIN, schoolId };
  const teacherUser = { id: 'teacher-user-1', role: ROLES.TEACHER, schoolId };
  const studentUser = { id: 'student-user-1', role: ROLES.STUDENT, schoolId };
  const parentUser = { id: 'parent-user-1', role: ROLES.PARENT, schoolId };

  it('should create timetable entry successfully when no collision exists', async () => {
    const origSchoolFindById = School.findById;
    const origSessionFindOne = AcademicSession.findOne;
    const origClassFindOne = Class.findOne;
    const origSectionFindOne = Section.findOne;
    const origSubjectFindOne = Subject.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTimetableFindOne = Timetable.findOne;
    const origTimetableSave = Timetable.prototype.save;

    School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
    AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });
    Subject.findOne = () => Promise.resolve({ _id: subjectId, schoolId });
    Teacher.findOne = () => Promise.resolve({ _id: teacherId, schoolId });
    Timetable.findOne = () => Promise.resolve(null); // No collision
    Timetable.prototype.save = function () {
      this._id = '507f1f77bcf86cd799439099';
      return Promise.resolve(this);
    };

    const result = await timetableService.createTimetableEntry(
      {
        academicSessionId: sessionId,
        classId,
        sectionId,
        subjectId,
        teacherId,
        dayOfWeek: DAY_OF_WEEK.MONDAY,
        periodNumber: 1,
        startTime: '08:00',
        endTime: '08:45',
        room: 'Room 101',
      },
      adminUser
    );

    School.findById = origSchoolFindById;
    AcademicSession.findOne = origSessionFindOne;
    Class.findOne = origClassFindOne;
    Section.findOne = origSectionFindOne;
    Subject.findOne = origSubjectFindOne;
    Teacher.findOne = origTeacherFindOne;
    Timetable.findOne = origTimetableFindOne;
    Timetable.prototype.save = origTimetableSave;

    assert.equal(result.dayOfWeek, DAY_OF_WEEK.MONDAY);
    assert.equal(result.periodNumber, 1);
  });

  it('should reject section collision when section already has class at that slot', async () => {
    const origSchoolFindById = School.findById;
    const origSessionFindOne = AcademicSession.findOne;
    const origClassFindOne = Class.findOne;
    const origSectionFindOne = Section.findOne;
    const origSubjectFindOne = Subject.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTimetableFindOne = Timetable.findOne;

    School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
    AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });
    Subject.findOne = () => Promise.resolve({ _id: subjectId, schoolId });
    Teacher.findOne = () => Promise.resolve({ _id: teacherId, schoolId });
    Timetable.findOne = () => Promise.resolve({ _id: 'conflict-id' }); // Section conflict

    await assert.rejects(
      () =>
        timetableService.createTimetableEntry(
          {
            academicSessionId: sessionId,
            classId,
            sectionId,
            subjectId,
            teacherId,
            dayOfWeek: DAY_OF_WEEK.MONDAY,
            periodNumber: 1,
            startTime: '08:00',
            endTime: '08:45',
          },
          adminUser
        ),
      (err) => err.statusCode === 409 && err.message.includes('Section collision')
    );

    School.findById = origSchoolFindById;
    AcademicSession.findOne = origSessionFindOne;
    Class.findOne = origClassFindOne;
    Section.findOne = origSectionFindOne;
    Subject.findOne = origSubjectFindOne;
    Teacher.findOne = origTeacherFindOne;
    Timetable.findOne = origTimetableFindOne;
  });

  it('should reject teacher collision when teacher is already scheduled in another section', async () => {
    const origSchoolFindById = School.findById;
    const origSessionFindOne = AcademicSession.findOne;
    const origClassFindOne = Class.findOne;
    const origSectionFindOne = Section.findOne;
    const origSubjectFindOne = Subject.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTimetableFindOne = Timetable.findOne;

    School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
    AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });
    Subject.findOne = () => Promise.resolve({ _id: subjectId, schoolId });
    Teacher.findOne = () => Promise.resolve({ _id: teacherId, schoolId });

    let callCount = 0;
    Timetable.findOne = () => {
      callCount++;
      if (callCount === 1) return Promise.resolve(null); // Section check passes
      return Promise.resolve({ _id: 'teacher-conflict-id' }); // Teacher conflict!
    };

    await assert.rejects(
      () =>
        timetableService.createTimetableEntry(
          {
            academicSessionId: sessionId,
            classId,
            sectionId,
            subjectId,
            teacherId,
            dayOfWeek: DAY_OF_WEEK.MONDAY,
            periodNumber: 2,
            startTime: '09:00',
            endTime: '09:45',
          },
          adminUser
        ),
      (err) => err.statusCode === 409 && err.message.includes('Teacher collision')
    );

    School.findById = origSchoolFindById;
    AcademicSession.findOne = origSessionFindOne;
    Class.findOne = origClassFindOne;
    Section.findOne = origSectionFindOne;
    Subject.findOne = origSubjectFindOne;
    Teacher.findOne = origTeacherFindOne;
    Timetable.findOne = origTimetableFindOne;
  });

  it('should reject room collision when room is already occupied during that slot', async () => {
    const origSchoolFindById = School.findById;
    const origSessionFindOne = AcademicSession.findOne;
    const origClassFindOne = Class.findOne;
    const origSectionFindOne = Section.findOne;
    const origSubjectFindOne = Subject.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTimetableFindOne = Timetable.findOne;

    School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
    AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    Section.findOne = () => Promise.resolve({ _id: sectionId, classId, schoolId });
    Subject.findOne = () => Promise.resolve({ _id: subjectId, schoolId });
    Teacher.findOne = () => Promise.resolve({ _id: teacherId, schoolId });

    let callCount = 0;
    Timetable.findOne = () => {
      callCount++;
      if (callCount <= 2) return Promise.resolve(null); // Section & teacher pass
      return Promise.resolve({ _id: 'room-conflict-id' }); // Room conflict!
    };

    await assert.rejects(
      () =>
        timetableService.createTimetableEntry(
          {
            academicSessionId: sessionId,
            classId,
            sectionId,
            subjectId,
            teacherId,
            dayOfWeek: DAY_OF_WEEK.MONDAY,
            periodNumber: 3,
            startTime: '10:00',
            endTime: '10:45',
            room: 'Auditorium',
          },
          adminUser
        ),
      (err) => err.statusCode === 409 && err.message.includes('Room collision')
    );

    School.findById = origSchoolFindById;
    AcademicSession.findOne = origSessionFindOne;
    Class.findOne = origClassFindOne;
    Section.findOne = origSectionFindOne;
    Subject.findOne = origSubjectFindOne;
    Teacher.findOne = origTeacherFindOne;
    Timetable.findOne = origTimetableFindOne;
  });

  it('should retrieve section timetable for authorized student', async () => {
    const origStudentFindOne = Student.findOne;
    const origTimetableFind = Timetable.find;

    Student.findOne = () =>
      Promise.resolve({
        _id: 'student-profile-1',
        userId: studentUser.id,
        sectionId: '507f1f77bcf86cd799439044',
        schoolId,
      });

    const mockQuery = {
      populate: () => mockQuery,
      sort: () => Promise.resolve([
        {
          _id: 'slot-1',
          dayOfWeek: 'MONDAY',
          periodNumber: 1,
          toJSON: () => ({ id: 'slot-1', dayOfWeek: 'MONDAY', periodNumber: 1 }),
        },
      ]),
    };

    Timetable.find = () => mockQuery;

    const result = await timetableService.getSectionTimetable('507f1f77bcf86cd799439044', studentUser);

    Student.findOne = origStudentFindOne;
    Timetable.find = origTimetableFind;

    assert.equal(result.length, 1);
    assert.equal(result[0].dayOfWeek, 'MONDAY');
  });

  it('should retrieve teacher timetable for authorized teacher', async () => {
    const origTeacherFindOne = Teacher.findOne;
    const origTimetableFind = Timetable.find;

    Teacher.findOne = () =>
      Promise.resolve({
        _id: teacherId,
        userId: teacherUser.id,
        schoolId,
      });

    const mockQuery = {
      populate: () => mockQuery,
      sort: () => Promise.resolve([
        {
          _id: 'slot-1',
          dayOfWeek: 'MONDAY',
          periodNumber: 2,
          toJSON: () => ({ id: 'slot-1', dayOfWeek: 'MONDAY', periodNumber: 2 }),
        },
      ]),
    };

    Timetable.find = () => mockQuery;

    const result = await timetableService.getTeacherTimetable(teacherId, teacherUser);

    Teacher.findOne = origTeacherFindOne;
    Timetable.find = origTimetableFind;

    assert.equal(result.length, 1);
    assert.equal(result[0].periodNumber, 2);
  });

  it('should update timetable entry successfully', async () => {
    const origTimetableFindOne = Timetable.findOne;
    const mockEntry = {
      _id: '507f1f77bcf86cd799439099',
      schoolId,
      academicSessionId: sessionId,
      classId,
      sectionId,
      subjectId,
      teacherId,
      dayOfWeek: DAY_OF_WEEK.MONDAY,
      periodNumber: 1,
      startTime: '08:00',
      endTime: '08:45',
      room: '101',
      isDeleted: false,
      save: () => Promise.resolve(mockEntry),
      toJSON: () => ({ id: '507f1f77bcf86cd799439099', room: '102-Updated' }),
    };

    let callCount = 0;
    Timetable.findOne = () => {
      callCount++;
      if (callCount === 1) return Promise.resolve(mockEntry); // Retrieve doc
      return Promise.resolve(null); // No collision on new values
    };

    const result = await timetableService.updateTimetableEntry(
      '507f1f77bcf86cd799439099',
      { room: '102-Updated' },
      adminUser
    );

    Timetable.findOne = origTimetableFindOne;

    assert.equal(result.room, '102-Updated');
  });

  it('should soft delete timetable entry', async () => {
    const origTimetableFindOne = Timetable.findOne;
    const mockEntry = {
      _id: '507f1f77bcf86cd799439099',
      schoolId,
      isDeleted: false,
      save: () => Promise.resolve(mockEntry),
    };

    Timetable.findOne = () => Promise.resolve(mockEntry);

    const result = await timetableService.deleteTimetableEntry('507f1f77bcf86cd799439099', adminUser);

    Timetable.findOne = origTimetableFindOne;

    assert.equal(result.success, true);
    assert.equal(mockEntry.isDeleted, true);
  });
});
