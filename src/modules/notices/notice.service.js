import mongoose from 'mongoose';
import Notice from './notice.model.js';
import School from '../schools/school.model.js';
import Student from '../students/student.model.js';
import Parent from '../parents/parent.model.js';
import StudentParent from '../parents/studentParent.model.js';
import AppError from '../../utils/AppError.js';
import { logAuditEvent } from '../audit/audit.service.js';
import { AUTH_EVENTS, ROLES, TARGET_AUDIENCE } from '../../constants/index.js';

export async function createNotice(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) throw AppError.notFound('School not found or inactive');

  const notice = new Notice({
    ...data,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await notice.save();

  await logAuditEvent({
    event: AUTH_EVENTS.NOTICE_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Notice',
    entityId: notice._id,
    details: { title: notice.title, targetAudience: notice.targetAudience, priority: notice.priority },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return notice.toJSON();
}

export async function publishNotice(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid notice ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const notice = await Notice.findOne(query);
  if (!notice) throw AppError.notFound('Notice not found');

  notice.isPublished = true;
  notice.publishedAt = new Date();
  notice.publishedBy = user.id;
  notice.updatedBy = user.id;
  await notice.save();

  await logAuditEvent({
    event: AUTH_EVENTS.NOTICE_PUBLISHED,
    userId: user.id,
    schoolId: notice.schoolId,
    entityType: 'Notice',
    entityId: notice._id,
    details: { publishedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return notice.toJSON();
}

export async function getNotices(filters, user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  } else if (filters.schoolId) {
    query.schoolId = filters.schoolId;
  }

  // Role Scoping for Student / Parent / Teacher
  if (user.role === ROLES.STUDENT) {
    query.isPublished = true;
    const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
    if (student) {
      query.$or = [
        { targetAudience: TARGET_AUDIENCE.ALL },
        { targetAudience: TARGET_AUDIENCE.STUDENTS },
        { targetAudience: TARGET_AUDIENCE.CLASS_SPECIFIC, targetClassIds: student.classId },
      ];
    } else {
      query.targetAudience = { $in: [TARGET_AUDIENCE.ALL, TARGET_AUDIENCE.STUDENTS] };
    }
  } else if (user.role === ROLES.PARENT) {
    query.isPublished = true;
    const parent = await Parent.findOne({ userId: user.id, schoolId: user.schoolId });
    if (parent) {
      const links = await StudentParent.find({ parentId: parent._id, schoolId: user.schoolId });
      const students = await Student.find({ _id: { $in: links.map((l) => l.studentId) }, schoolId: user.schoolId });
      const classIds = students.map((s) => s.classId);
      query.$or = [
        { targetAudience: TARGET_AUDIENCE.ALL },
        { targetAudience: TARGET_AUDIENCE.PARENTS },
        { targetAudience: TARGET_AUDIENCE.CLASS_SPECIFIC, targetClassIds: { $in: classIds } },
      ];
    } else {
      query.targetAudience = { $in: [TARGET_AUDIENCE.ALL, TARGET_AUDIENCE.PARENTS] };
    }
  } else if (user.role === ROLES.TEACHER) {
    query.isPublished = true;
    query.targetAudience = { $in: [TARGET_AUDIENCE.ALL, TARGET_AUDIENCE.TEACHERS] };
  }

  if (filters.priority) query.priority = filters.priority;
  if (filters.isPinned !== undefined) query.isPinned = filters.isPinned;

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [notices, total] = await Promise.all([
    Notice.find(query)
      .populate('publishedBy', 'firstName lastName name')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notice.countDocuments(query),
  ]);

  return {
    notices: notices.map((n) => n.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getNoticeById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid notice ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const notice = await Notice.findOne(query).populate('publishedBy', 'firstName lastName name');
  if (!notice) throw AppError.notFound('Notice not found');

  if ((user.role === ROLES.STUDENT || user.role === ROLES.PARENT || user.role === ROLES.TEACHER) && !notice.isPublished) {
    throw AppError.notFound('Notice not found');
  }

  return notice.toJSON();
}

export async function updateNotice(id, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid notice ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const notice = await Notice.findOne(query);
  if (!notice) throw AppError.notFound('Notice not found');

  Object.assign(notice, data);
  notice.updatedBy = user.id;
  await notice.save();

  await logAuditEvent({
    event: AUTH_EVENTS.NOTICE_UPDATED,
    userId: user.id,
    schoolId: notice.schoolId,
    entityType: 'Notice',
    entityId: notice._id,
    details: { changes: Object.keys(data) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return notice.toJSON();
}

export async function deleteNotice(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid notice ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const notice = await Notice.findOne(query);
  if (!notice) throw AppError.notFound('Notice not found');

  notice.isDeleted = true;
  notice.deletedAt = new Date();
  notice.deletedBy = user.id;
  await notice.save();

  await logAuditEvent({
    event: AUTH_EVENTS.NOTICE_DELETED,
    userId: user.id,
    schoolId: notice.schoolId,
    entityType: 'Notice',
    entityId: notice._id,
    details: { deletedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Notice deleted successfully' };
}
