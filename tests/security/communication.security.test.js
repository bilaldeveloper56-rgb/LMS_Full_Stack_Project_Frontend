import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Notice from '../../src/modules/notices/notice.model.js';
import User from '../../src/modules/users/user.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import Student from '../../src/modules/students/student.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import TeacherAssignment from '../../src/modules/academics/teacherAssignment.model.js';
import * as noticeService from '../../src/modules/notices/notice.service.js';
import * as messageService from '../../src/modules/messages/message.service.js';
import { ROLES, TARGET_AUDIENCE } from '../../src/constants/index.js';

describe('Phase 8 Communication Security & Multi-Tenancy Tests', () => {
  const schoolA = '507f1f77bcf86cd799439011';
  const schoolB = '507f1f77bcf86cd799439099';
  const studentUserId = '507f1f77bcf86cd799439022';
  const teacherUserId = '507f1f77bcf86cd799439033';
  const parentUserId = '507f1f77bcf86cd799439044';
  const noticeId = '507f1f77bcf86cd799439055';

  const studentUser = { id: studentUserId, role: ROLES.STUDENT, schoolId: schoolA };
  const parentUser = { id: parentUserId, role: ROLES.PARENT, schoolId: schoolA };

  it('should prevent students from viewing draft unpublished notices', async () => {
    const mockNotice = {
      _id: noticeId,
      schoolId: schoolA,
      title: 'Draft Exam Schedule',
      isPublished: false,
    };

    const origNoticeFindOne = Notice.findOne;
    const mockQuery = {
      populate: () => Promise.resolve(mockNotice),
    };
    Notice.findOne = () => mockQuery;

    await assert.rejects(
      () => noticeService.getNoticeById(noticeId, studentUser),
      (err) => err.statusCode === 404
    );

    Notice.findOne = origNoticeFindOne;
  });

  it('should reject student messaging unassigned teacher', async () => {
    const origUserFindById = User.findById;
    const origStudentFindOne = Student.findOne;
    const origTeacherFindOne = Teacher.findOne;
    const origTeacherAssignmentFindOne = TeacherAssignment.findOne;

    User.findById = () =>
      Promise.resolve({
        _id: teacherUserId,
        role: ROLES.TEACHER,
        schoolId: schoolA,
      });

    Student.findOne = () =>
      Promise.resolve({
        _id: 'student-profile-1',
        userId: studentUserId,
        sectionId: '507f1f77bcf86cd799439066',
        schoolId: schoolA,
      });

    Teacher.findOne = () =>
      Promise.resolve({
        _id: 'teacher-profile-1',
        userId: teacherUserId,
        schoolId: schoolA,
      });

    TeacherAssignment.findOne = () => Promise.resolve(null); // Not assigned to this student's section!

    await assert.rejects(
      () =>
        messageService.startConversation(
          {
            recipientUserId: teacherUserId,
            initialMessage: 'Hello',
          },
          studentUser
        ),
      (err) => err.statusCode === 403 && err.message.includes('teachers assigned to their section')
    );

    User.findById = origUserFindById;
    Student.findOne = origStudentFindOne;
    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origTeacherAssignmentFindOne;
  });

  it('should reject cross-school messaging between users of different schools', async () => {
    const userInSchoolB = '507f1f77bcf86cd799439088';
    const origUserFindById = User.findById;

    User.findById = () =>
      Promise.resolve({
        _id: userInSchoolB,
        role: ROLES.TEACHER,
        schoolId: schoolB, // Different school!
      });

    await assert.rejects(
      () =>
        messageService.startConversation(
          {
            recipientUserId: userInSchoolB,
            initialMessage: 'Hello from School A',
          },
          studentUser
        ),
      (err) => err.statusCode === 403 && err.message.includes('another school')
    );

    User.findById = origUserFindById;
  });

  it('should reject parent messaging teacher of unlinked child', async () => {
    const origUserFindById = User.findById;
    const origParentFindOne = Parent.findOne;
    const origStudentParentFind = StudentParent.find;
    const origStudentFind = Student.find;
    const origTeacherFindOne = Teacher.findOne;
    const origTeacherAssignmentFindOne = TeacherAssignment.findOne;

    User.findById = () =>
      Promise.resolve({
        _id: teacherUserId,
        role: ROLES.TEACHER,
        schoolId: schoolA,
      });

    Parent.findOne = () =>
      Promise.resolve({
        _id: 'parent-profile-1',
        userId: parentUserId,
        schoolId: schoolA,
      });

    StudentParent.find = () =>
      Promise.resolve([{ parentId: 'parent-profile-1', studentId: 'student-profile-1', schoolId: schoolA }]);

    Student.find = () =>
      Promise.resolve([{ _id: 'student-profile-1', sectionId: 'section-child-1', schoolId: schoolA }]);

    Teacher.findOne = () =>
      Promise.resolve({ _id: 'teacher-profile-1', userId: teacherUserId, schoolId: schoolA });

    TeacherAssignment.findOne = () => Promise.resolve(null); // Teacher does NOT teach section-child-1

    await assert.rejects(
      () =>
        messageService.startConversation(
          {
            recipientUserId: teacherUserId,
            initialMessage: 'Hello teacher',
          },
          parentUser
        ),
      (err) => err.statusCode === 403 && err.message.includes('teachers assigned to their children')
    );

    User.findById = origUserFindById;
    Parent.findOne = origParentFindOne;
    StudentParent.find = origStudentParentFind;
    Student.find = origStudentFind;
    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.findOne = origTeacherAssignmentFindOne;
  });
});
