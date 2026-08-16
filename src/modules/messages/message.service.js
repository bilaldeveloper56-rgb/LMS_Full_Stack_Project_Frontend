import mongoose from 'mongoose';
import Conversation from './conversation.model.js';
import Message from './message.model.js';
import User from '../users/user.model.js';
import Teacher from '../teachers/teacher.model.js';
import Student from '../students/student.model.js';
import Parent from '../parents/parent.model.js';
import StudentParent from '../parents/studentParent.model.js';
import TeacherAssignment from '../academics/teacherAssignment.model.js';
import AppError from '../../utils/AppError.js';
import { logAuditEvent } from '../audit/audit.service.js';
import { AUTH_EVENTS, ROLES } from '../../constants/index.js';

export async function validateParticipantRelationship(senderUser, recipientUser) {
  // Same user check
  if (senderUser.id.toString() === recipientUser._id.toString()) {
    throw AppError.badRequest('Cannot start a conversation with yourself');
  }

  // Cross-school check
  if (senderUser.role !== ROLES.SUPER_ADMIN && recipientUser.schoolId?.toString() !== senderUser.schoolId?.toString()) {
    throw AppError.forbidden('Cannot message users from another school');
  }

  // Super Admin & School Admin can message anyone
  if (senderUser.role === ROLES.SUPER_ADMIN || senderUser.role === ROLES.SCHOOL_ADMIN) {
    return true;
  }

  // Anyone can message School Admin
  if (recipientUser.role === ROLES.SCHOOL_ADMIN || recipientUser.role === ROLES.SUPER_ADMIN) {
    return true;
  }

  const schoolId = senderUser.schoolId;

  // Teacher rules
  if (senderUser.role === ROLES.TEACHER) {
    const teacher = await Teacher.findOne({ userId: senderUser.id, schoolId });
    if (!teacher) throw AppError.forbidden('Teacher profile not found');

    const assignments = await TeacherAssignment.find({ teacherId: teacher._id, schoolId });
    const assignedSectionIds = assignments.map((a) => a.sectionId.toString());

    if (recipientUser.role === ROLES.STUDENT) {
      const student = await Student.findOne({ userId: recipientUser._id, schoolId });
      if (!student || !assignedSectionIds.includes(student.sectionId.toString())) {
        throw AppError.forbidden('Teachers can only message students in their assigned sections');
      }
      return true;
    }

    if (recipientUser.role === ROLES.PARENT) {
      const parent = await Parent.findOne({ userId: recipientUser._id, schoolId });
      if (!parent) throw AppError.forbidden('Parent profile not found');

      const links = await StudentParent.find({ parentId: parent._id, schoolId });
      const students = await Student.find({ _id: { $in: links.map((l) => l.studentId) }, schoolId });
      const hasAssignedChild = students.some((s) => assignedSectionIds.includes(s.sectionId.toString()));

      if (!hasAssignedChild) {
        throw AppError.forbidden('Teachers can only message parents of students in their assigned sections');
      }
      return true;
    }
  }

  // Student rules
  if (senderUser.role === ROLES.STUDENT) {
    if (recipientUser.role === ROLES.TEACHER) {
      const student = await Student.findOne({ userId: senderUser.id, schoolId });
      if (!student) throw AppError.forbidden('Student profile not found');

      const teacher = await Teacher.findOne({ userId: recipientUser._id, schoolId });
      if (!teacher) throw AppError.forbidden('Teacher profile not found');

      const assignment = await TeacherAssignment.findOne({
        schoolId,
        teacherId: teacher._id,
        sectionId: student.sectionId,
      });

      if (!assignment) {
        throw AppError.forbidden('Students can only message teachers assigned to their section');
      }
      return true;
    }
    throw AppError.forbidden('Students can only message their assigned teachers or school admins');
  }

  // Parent rules
  if (senderUser.role === ROLES.PARENT) {
    if (recipientUser.role === ROLES.TEACHER) {
      const parent = await Parent.findOne({ userId: senderUser.id, schoolId });
      if (!parent) throw AppError.forbidden('Parent profile not found');

      const links = await StudentParent.find({ parentId: parent._id, schoolId });
      const students = await Student.find({ _id: { $in: links.map((l) => l.studentId) }, schoolId });
      const studentSectionIds = students.map((s) => s.sectionId);

      const teacher = await Teacher.findOne({ userId: recipientUser._id, schoolId });
      if (!teacher) throw AppError.forbidden('Teacher profile not found');

      const assignment = await TeacherAssignment.findOne({
        schoolId,
        teacherId: teacher._id,
        sectionId: { $in: studentSectionIds },
      });

      if (!assignment) {
        throw AppError.forbidden('Parents can only message teachers assigned to their children');
      }
      return true;
    }
    throw AppError.forbidden('Parents can only message teachers of their children or school admins');
  }

  return true;
}

export async function startConversation(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? user.schoolId : user.schoolId;
  if (!schoolId && user.role !== ROLES.SUPER_ADMIN) throw AppError.badRequest('School ID is required');

  if (!mongoose.Types.ObjectId.isValid(data.recipientUserId)) {
    throw AppError.badRequest('Invalid recipient user ID format');
  }

  const recipientUser = await User.findById(data.recipientUserId);
  if (!recipientUser || recipientUser.isDeleted) {
    throw AppError.notFound('Recipient user not found');
  }

  await validateParticipantRelationship(user, recipientUser);

  const effectiveSchoolId = schoolId || recipientUser.schoolId;

  // Check if DIRECT conversation already exists
  let conversation = await Conversation.findOne({
    schoolId: effectiveSchoolId,
    type: 'DIRECT',
    'participants.userId': { $all: [user.id, recipientUser._id] },
  });

  if (!conversation) {
    conversation = new Conversation({
      schoolId: effectiveSchoolId,
      type: 'DIRECT',
      title: data.title || '',
      participants: [
        { userId: user.id, role: user.role, unreadCount: 0, lastReadAt: new Date() },
        { userId: recipientUser._id, role: recipientUser.role, unreadCount: 1, lastReadAt: new Date() },
      ],
      lastMessage: {
        content: data.initialMessage,
        senderId: user.id,
        sentAt: new Date(),
      },
      createdBy: user.id,
      updatedBy: user.id,
    });
    await conversation.save();
  } else {
    // Increment recipient's unread count
    const recipient = conversation.participants.find((p) => p.userId.toString() === recipientUser._id.toString());
    if (recipient) recipient.unreadCount += 1;
    conversation.lastMessage = {
      content: data.initialMessage,
      senderId: user.id,
      sentAt: new Date(),
    };
    conversation.updatedBy = user.id;
    await conversation.save();
  }

  // Create Message
  const message = new Message({
    schoolId: effectiveSchoolId,
    conversationId: conversation._id,
    senderUserId: user.id,
    senderRole: user.role,
    content: data.initialMessage,
    attachments: data.attachments || [],
    isReadBy: [{ userId: user.id, readAt: new Date() }],
  });

  await message.save();

  await logAuditEvent({
    event: AUTH_EVENTS.CONVERSATION_CREATED,
    userId: user.id,
    schoolId: effectiveSchoolId,
    entityType: 'Conversation',
    entityId: conversation._id,
    details: { recipientId: recipientUser._id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return {
    conversation: conversation.toJSON(),
    message: message.toJSON(),
  };
}

export async function getConversations(filters, user) {
  const query = {
    'participants.userId': user.id,
  };
  if (user.schoolId) query.schoolId = user.schoolId;

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .populate('participants.userId', 'firstName lastName name email role')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(query),
  ]);

  return {
    conversations: conversations.map((c) => c.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getConversationMessages(conversationId, filters, user) {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw AppError.badRequest('Invalid conversation ID format');
  }

  const query = { _id: conversationId, 'participants.userId': user.id };
  if (user.schoolId) query.schoolId = user.schoolId;

  const conversation = await Conversation.findOne(query);
  if (!conversation) throw AppError.notFound('Conversation not found or access denied');

  // Mark as read for this user
  const participant = conversation.participants.find((p) => p.userId.toString() === user.id);
  if (participant) {
    participant.unreadCount = 0;
    participant.lastReadAt = new Date();
    await conversation.save();
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ conversationId: conversation._id })
      .populate('senderUserId', 'firstName lastName name email role')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversationId: conversation._id }),
  ]);

  return {
    conversation: conversation.toJSON(),
    messages: messages.map((m) => m.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function sendMessage(conversationId, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw AppError.badRequest('Invalid conversation ID format');
  }

  const query = { _id: conversationId, 'participants.userId': user.id };
  if (user.schoolId) query.schoolId = user.schoolId;

  const conversation = await Conversation.findOne(query);
  if (!conversation) throw AppError.notFound('Conversation not found or access denied');

  // Update conversation
  conversation.participants.forEach((p) => {
    if (p.userId.toString() === user.id) {
      p.lastReadAt = new Date();
    } else {
      p.unreadCount += 1;
    }
  });

  conversation.lastMessage = {
    content: data.content,
    senderId: user.id,
    sentAt: new Date(),
  };
  conversation.updatedBy = user.id;
  await conversation.save();

  // Create message
  const message = new Message({
    schoolId: conversation.schoolId,
    conversationId: conversation._id,
    senderUserId: user.id,
    senderRole: user.role,
    content: data.content,
    attachments: data.attachments || [],
    isReadBy: [{ userId: user.id, readAt: new Date() }],
  });

  await message.save();

  await logAuditEvent({
    event: AUTH_EVENTS.MESSAGE_SENT,
    userId: user.id,
    schoolId: conversation.schoolId,
    entityType: 'Message',
    entityId: message._id,
    details: { conversationId: conversation._id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return message.toJSON();
}
