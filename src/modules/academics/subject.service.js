import mongoose from 'mongoose';
import Subject from './subject.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { ROLES, AUTH_EVENTS } from '../../constants/index.js';
import { logAuditEvent } from '../audit/audit.service.js';

function resolveSchoolId(user, explicitSchoolId) {
  if (user.role === ROLES.SUPER_ADMIN) {
    return explicitSchoolId || user.schoolId || null;
  }
  return user.schoolId;
}

export async function createSubject(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  // Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // Check duplicate code in same school
  const existing = await Subject.findOne({
    schoolId,
    code: data.code.trim().toUpperCase(),
  });
  if (existing) {
    throw AppError.conflict(`Subject with code '${data.code.toUpperCase()}' already exists in this school`);
  }

  const subject = new Subject({
    ...data,
    code: data.code.trim().toUpperCase(),
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await subject.save();

  await logAuditEvent({
    event: AUTH_EVENTS.SUBJECT_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Subject',
    entityId: subject._id,
    details: { name: subject.name, code: subject.code, subjectType: subject.subjectType },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return subject.toJSON();
}

export async function getSubjects(params, user) {
  const {
    page = 1,
    limit = 10,
    subjectType,
    isOptional,
    isActive,
    search,
    schoolId: querySchoolId,
    sortBy = 'name',
    sortOrder = 'asc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  if (subjectType) {
    query.subjectType = subjectType;
  }

  if (typeof isOptional === 'boolean') {
    query.isOptional = isOptional;
  }

  if (typeof isActive === 'boolean') {
    query.isActive = isActive;
  }

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = [{ name: searchRegex }, { code: searchRegex }];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [subjects, total] = await Promise.all([
    Subject.find(query).sort(sort).skip(skip).limit(limit),
    Subject.countDocuments(query),
  ]);

  return {
    subjects: subjects.map((s) => s.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getSubjectById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid subject ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const subject = await Subject.findOne(query);
  if (!subject) {
    throw AppError.notFound('Subject not found');
  }

  return subject.toJSON();
}

export async function updateSubject(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid subject ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const subject = await Subject.findOne(query);
  if (!subject) {
    throw AppError.notFound('Subject not found');
  }

  // Check duplicate code if code changed
  if (updates.code && updates.code.trim().toUpperCase() !== subject.code) {
    const existing = await Subject.findOne({
      schoolId: subject.schoolId,
      code: updates.code.trim().toUpperCase(),
      _id: { $ne: subject._id },
    });
    if (existing) {
      throw AppError.conflict(`Subject with code '${updates.code.toUpperCase()}' already exists`);
    }
    subject.code = updates.code.trim().toUpperCase();
  }

  if (updates.name) subject.name = updates.name.trim();
  if (updates.description !== undefined) subject.description = updates.description;
  if (updates.subjectType) subject.subjectType = updates.subjectType;
  if (updates.isOptional !== undefined) subject.isOptional = updates.isOptional;
  if (updates.isActive !== undefined) subject.isActive = updates.isActive;

  subject.updatedBy = user.id;
  await subject.save();

  await logAuditEvent({
    event: AUTH_EVENTS.SUBJECT_UPDATED,
    userId: user.id,
    schoolId: subject.schoolId,
    entityType: 'Subject',
    entityId: subject._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return subject.toJSON();
}

export async function deleteSubject(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid subject ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const subject = await Subject.findOne(query);
  if (!subject) {
    throw AppError.notFound('Subject not found');
  }

  subject.isDeleted = true;
  subject.deletedAt = new Date();
  subject.deletedBy = user.id;
  await subject.save();

  await logAuditEvent({
    event: AUTH_EVENTS.SUBJECT_DELETED,
    userId: user.id,
    schoolId: subject.schoolId,
    entityType: 'Subject',
    entityId: subject._id,
    details: { name: subject.name, code: subject.code },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Subject deleted successfully' };
}
