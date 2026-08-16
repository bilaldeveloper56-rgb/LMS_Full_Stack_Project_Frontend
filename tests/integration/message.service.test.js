import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Conversation from '../../src/modules/messages/conversation.model.js';
import Message from '../../src/modules/messages/message.model.js';
import User from '../../src/modules/users/user.model.js';
import Teacher from '../../src/modules/teachers/teacher.model.js';
import Student from '../../src/modules/students/student.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import TeacherAssignment from '../../src/modules/academics/teacherAssignment.model.js';
import * as messageService from '../../src/modules/messages/message.service.js';
import { ROLES } from '../../src/constants/index.js';

describe('Message Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const teacherUserId = '507f1f77bcf86cd799439022';
  const studentUserId = '507f1f77bcf86cd799439033';
  const teacherProfileId = '507f1f77bcf86cd799439044';
  const studentProfileId = '507f1f77bcf86cd799439055';
  const sectionId = '507f1f77bcf86cd799439066';
  const conversationId = '507f1f77bcf86cd799439077';

  const teacherUser = { id: teacherUserId, role: ROLES.TEACHER, schoolId };
  const studentUser = { id: studentUserId, role: ROLES.STUDENT, schoolId };

  it('should start conversation between teacher and assigned student', async () => {
    const origUserFindById = User.findById;
    const origTeacherFindOne = Teacher.findOne;
    const origTeacherAssignmentFind = TeacherAssignment.find;
    const origStudentFindOne = Student.findOne;
    const origConversationFindOne = Conversation.findOne;
    const origConversationSave = Conversation.prototype.save;
    const origMessageSave = Message.prototype.save;

    User.findById = () =>
      Promise.resolve({
        _id: studentUserId,
        role: ROLES.STUDENT,
        schoolId,
      });

    Teacher.findOne = () =>
      Promise.resolve({
        _id: teacherProfileId,
        userId: teacherUserId,
        schoolId,
      });

    TeacherAssignment.find = () =>
      Promise.resolve([
        {
          _id: 'assign-1',
          teacherId: teacherProfileId,
          sectionId,
          schoolId,
        },
      ]);

    Student.findOne = () =>
      Promise.resolve({
        _id: studentProfileId,
        userId: studentUserId,
        sectionId,
        schoolId,
      });

    Conversation.findOne = () => Promise.resolve(null); // No existing direct conversation

    Conversation.prototype.save = function () {
      this._id = conversationId;
      return Promise.resolve(this);
    };

    Message.prototype.save = function () {
      this._id = 'msg-1';
      return Promise.resolve(this);
    };

    const result = await messageService.startConversation(
      {
        recipientUserId: studentUserId,
        initialMessage: 'Please remember to bring your textbook tomorrow.',
      },
      teacherUser
    );

    User.findById = origUserFindById;
    Teacher.findOne = origTeacherFindOne;
    TeacherAssignment.find = origTeacherAssignmentFind;
    Student.findOne = origStudentFindOne;
    Conversation.findOne = origConversationFindOne;
    Conversation.prototype.save = origConversationSave;
    Message.prototype.save = origMessageSave;

    assert.equal(result.conversation.type, 'DIRECT');
    assert.equal(result.message.content, 'Please remember to bring your textbook tomorrow.');
  });

  it('should retrieve conversation messages and reset unread count', async () => {
    const mockConversation = {
      _id: conversationId,
      schoolId,
      participants: [
        { userId: teacherUserId, role: 'TEACHER', unreadCount: 0 },
        { userId: studentUserId, role: 'STUDENT', unreadCount: 2 },
      ],
      save: function () {
        return Promise.resolve(this);
      },
      toJSON: function () {
        return { ...this };
      },
    };

    const origConversationFindOne = Conversation.findOne;
    const origMessageFind = Message.find;
    const origMessageCount = Message.countDocuments;

    Conversation.findOne = () => Promise.resolve(mockConversation);

    const mockQuery = {
      populate: () => mockQuery,
      sort: () => mockQuery,
      skip: () => mockQuery,
      limit: () =>
        Promise.resolve([
          {
            _id: 'msg-1',
            content: 'Hello teacher!',
            senderRole: 'STUDENT',
            toJSON: () => ({ id: 'msg-1', content: 'Hello teacher!' }),
          },
        ]),
    };

    Message.find = () => mockQuery;
    Message.countDocuments = () => Promise.resolve(1);

    const result = await messageService.getConversationMessages(conversationId, {}, studentUser);

    Conversation.findOne = origConversationFindOne;
    Message.find = origMessageFind;
    Message.countDocuments = origMessageCount;

    assert.equal(result.messages.length, 1);
    assert.equal(mockConversation.participants[1].unreadCount, 0); // Reset to 0
  });

  it('should send a reply message to conversation and update unread count', async () => {
    const mockConversation = {
      _id: conversationId,
      schoolId,
      participants: [
        { userId: teacherUserId, role: 'TEACHER', unreadCount: 0 },
        { userId: studentUserId, role: 'STUDENT', unreadCount: 0 },
      ],
      lastMessage: {},
      save: function () {
        return Promise.resolve(this);
      },
    };

    const origConversationFindOne = Conversation.findOne;
    const origMessageSave = Message.prototype.save;

    Conversation.findOne = () => Promise.resolve(mockConversation);
    Message.prototype.save = function () {
      this._id = 'msg-reply-1';
      return Promise.resolve(this);
    };

    const message = await messageService.sendMessage(
      conversationId,
      { content: 'Thank you teacher, I will bring it.' },
      studentUser
    );

    Conversation.findOne = origConversationFindOne;
    Message.prototype.save = origMessageSave;

    assert.equal(message.content, 'Thank you teacher, I will bring it.');
    assert.equal(mockConversation.participants[0].unreadCount, 1); // Teacher received 1 unread
  });

  it('should allow parent to message school admin directly', async () => {
    const adminUserId = '507f1f77bcf86cd799439099';
    const parentUserId = '507f1f77bcf86cd799439088';
    const parentUser = { id: parentUserId, role: ROLES.PARENT, schoolId };

    const origUserFindById = User.findById;
    const origConversationFindOne = Conversation.findOne;
    const origConversationSave = Conversation.prototype.save;
    const origMessageSave = Message.prototype.save;

    User.findById = () =>
      Promise.resolve({
        _id: adminUserId,
        role: ROLES.SCHOOL_ADMIN,
        schoolId,
      });

    Conversation.findOne = () => Promise.resolve(null);
    Conversation.prototype.save = function () {
      this._id = 'conv-admin-1';
      return Promise.resolve(this);
    };
    Message.prototype.save = function () {
      this._id = 'msg-admin-1';
      return Promise.resolve(this);
    };

    const result = await messageService.startConversation(
      {
        recipientUserId: adminUserId,
        initialMessage: 'Inquiry regarding school bus routes.',
      },
      parentUser
    );

    User.findById = origUserFindById;
    Conversation.findOne = origConversationFindOne;
    Conversation.prototype.save = origConversationSave;
    Message.prototype.save = origMessageSave;

    assert.equal(result.conversation.type, 'DIRECT');
    assert.equal(result.message.content, 'Inquiry regarding school bus routes.');
  });

  it('should reject starting conversation with oneself', async () => {
    const origUserFindById = User.findById;
    User.findById = () =>
      Promise.resolve({
        _id: teacherUserId,
        role: ROLES.TEACHER,
        schoolId,
      });

    await assert.rejects(
      () =>
        messageService.startConversation(
          {
            recipientUserId: teacherUserId,
            initialMessage: 'Self note',
          },
          teacherUser
        ),
      (err) => err.statusCode === 400 && err.message.includes('yourself')
    );

    User.findById = origUserFindById;
  });
});
