import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Notice from '../../src/modules/notices/notice.model.js';
import School from '../../src/modules/schools/school.model.js';
import Student from '../../src/modules/students/student.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import * as noticeService from '../../src/modules/notices/notice.service.js';
import { ROLES, TARGET_AUDIENCE } from '../../src/constants/index.js';

describe('Notice Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const noticeId = '507f1f77bcf86cd799439022';
  const classId = '507f1f77bcf86cd799439033';

  const adminUser = { id: 'admin-1', role: ROLES.SCHOOL_ADMIN, schoolId };
  const studentUser = { id: 'student-user-1', role: ROLES.STUDENT, schoolId };
  const parentUser = { id: 'parent-user-1', role: ROLES.PARENT, schoolId };

  it('should create a draft notice', async () => {
    const origSchoolFindById = School.findById;
    const origNoticeSave = Notice.prototype.save;

    School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
    Notice.prototype.save = function () {
      this._id = noticeId;
      return Promise.resolve(this);
    };

    const notice = await noticeService.createNotice(
      {
        title: 'Winter Vacation Announcement',
        content: 'School will remain closed from Dec 20 to Jan 5.',
        targetAudience: TARGET_AUDIENCE.ALL,
      },
      adminUser
    );

    School.findById = origSchoolFindById;
    Notice.prototype.save = origNoticeSave;

    assert.equal(notice.title, 'Winter Vacation Announcement');
    assert.equal(notice.isPublished, false);
  });

  it('should publish a notice and record timestamp and publisher', async () => {
    const mockNotice = {
      _id: noticeId,
      schoolId,
      title: 'Winter Vacation Announcement',
      isPublished: false,
      save: function () {
        return Promise.resolve(this);
      },
      toJSON: function () {
        return { ...this };
      },
    };

    const origNoticeFindOne = Notice.findOne;
    Notice.findOne = () => Promise.resolve(mockNotice);

    const published = await noticeService.publishNotice(noticeId, adminUser);

    Notice.findOne = origNoticeFindOne;

    assert.equal(published.isPublished, true);
    assert.equal(published.publishedBy, adminUser.id);
  });

  it('should scope published notices for enrolled student', async () => {
    const origStudentFindOne = Student.findOne;
    const origNoticeFind = Notice.find;
    const origNoticeCount = Notice.countDocuments;

    Student.findOne = () =>
      Promise.resolve({
        _id: 'student-profile-1',
        userId: studentUser.id,
        classId,
        schoolId,
      });

    const mockQuery = {
      populate: () => mockQuery,
      sort: () => mockQuery,
      skip: () => mockQuery,
      limit: () =>
        Promise.resolve([
          {
            _id: noticeId,
            title: 'Class 10 Science Exhibition',
            targetAudience: TARGET_AUDIENCE.CLASS_SPECIFIC,
            isPublished: true,
            toJSON: () => ({ id: noticeId, title: 'Class 10 Science Exhibition' }),
          },
        ]),
    };

    Notice.find = () => mockQuery;
    Notice.countDocuments = () => Promise.resolve(1);

    const result = await noticeService.getNotices({}, studentUser);

    Student.findOne = origStudentFindOne;
    Notice.find = origNoticeFind;
    Notice.countDocuments = origNoticeCount;

    assert.equal(result.notices.length, 1);
    assert.equal(result.notices[0].title, 'Class 10 Science Exhibition');
  });

  it('should soft delete notice', async () => {
    const mockNotice = {
      _id: noticeId,
      schoolId,
      isDeleted: false,
      save: function () {
        return Promise.resolve(this);
      },
    };

    const origNoticeFindOne = Notice.findOne;
    Notice.findOne = () => Promise.resolve(mockNotice);

    const result = await noticeService.deleteNotice(noticeId, adminUser);

    Notice.findOne = origNoticeFindOne;

    assert.equal(result.success, true);
    assert.equal(mockNotice.isDeleted, true);
  });

  it('should update notice content and priority', async () => {
    const mockNotice = {
      _id: noticeId,
      schoolId,
      title: 'Old Title',
      content: 'Old Content',
      priority: 'NORMAL',
      save: function () {
        return Promise.resolve(this);
      },
      toJSON: function () {
        return { ...this };
      },
    };

    const origNoticeFindOne = Notice.findOne;
    Notice.findOne = () => Promise.resolve(mockNotice);

    const updated = await noticeService.updateNotice(
      noticeId,
      { title: 'New Urgent Title', priority: 'URGENT' },
      adminUser
    );

    Notice.findOne = origNoticeFindOne;

    assert.equal(updated.title, 'New Urgent Title');
    assert.equal(updated.priority, 'URGENT');
  });

  it('should retrieve notice by ID for administrator', async () => {
    const mockNotice = {
      _id: noticeId,
      schoolId,
      title: 'Admin Notice',
      isPublished: true,
      toJSON: () => ({ id: noticeId, title: 'Admin Notice' }),
    };

    const origNoticeFindOne = Notice.findOne;
    const mockQuery = {
      populate: () => Promise.resolve(mockNotice),
    };
    Notice.findOne = () => mockQuery;

    const notice = await noticeService.getNoticeById(noticeId, adminUser);

    Notice.findOne = origNoticeFindOne;

    assert.equal(notice.title, 'Admin Notice');
  });
});
