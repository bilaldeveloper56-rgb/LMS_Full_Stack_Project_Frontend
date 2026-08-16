import mongoose from 'mongoose';
import Class from './class.model.js';
import AcademicSession from './academicSession.model.js';
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

export async function createClass(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  // Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // Verify academic session belongs to same school
  const session = await AcademicSession.findOne({
    _id: data.academicSessionId,
    schoolId,
  });
  if (!session) {
    throw AppError.notFound('Academic session not found in this school');
  }

  // Check duplicate code in same school and session
  const existing = await Class.findOne({
    schoolId,
    academicSessionId: data.academicSessionId,
    code: data.code.trim().toUpperCase(),
  });
  if (existing) {
    throw AppError.conflict(
      `Class with code '${data.code.toUpperCase()}' already exists in this academic session`
    );
  }

  const cls = new Class({
    ...data,
    code: data.code.trim().toUpperCase(),
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await cls.save();

  await logAuditEvent({
    event: AUTH_EVENTS.CLASS_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Class',
    entityId: cls._id,
    details: { name: cls.name, code: cls.code, academicSessionId: cls.academicSessionId },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return cls.toJSON();
}

export async function getClasses(params, user) {
  const {
    page = 1,
    limit = 10,
    academicSessionId,
    isActive,
    search,
    schoolId: querySchoolId,
    sortBy = 'displayOrder',
    sortOrder = 'asc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  if (academicSessionId) {
    query.academicSessionId = academicSessionId;
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

  const [classes, total] = await Promise.all([
    Class.find(query).populate('academicSessionId', 'name status isCurrent').sort(sort).skip(skip).limit(limit),
    Class.countDocuments(query),
  ]);

  return {
    classes: classes.map((c) => c.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getClassById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid class ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const cls = await Class.findOne(query).populate('academicSessionId', 'name status isCurrent');
  if (!cls) {
    throw AppError.notFound('Class not found');
  }

  return cls.toJSON();
}

export async function updateClass(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid class ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const cls = await Class.findOne(query);
  if (!cls) {
    throw AppError.notFound('Class not found');
  }

  // Check duplicate code if code changed
  if (updates.code && updates.code.trim().toUpperCase() !== cls.code) {
    const existing = await Class.findOne({
      schoolId: cls.schoolId,
      academicSessionId: cls.academicSessionId,
      code: updates.code.trim().toUpperCase(),
      _id: { $ne: cls._id },
    });
    if (existing) {
      throw AppError.conflict(
        `Class with code '${updates.code.toUpperCase()}' already exists in this session`
      );
    }
    cls.code = updates.code.trim().toUpperCase();
  }

  if (updates.name) cls.name = updates.name.trim();
  if (updates.description !== undefined) cls.description = updates.description;
  if (updates.displayOrder !== undefined) cls.displayOrder = updates.displayOrder;
  if (updates.isActive !== undefined) cls.isActive = updates.isActive;

  cls.updatedBy = user.id;
  await cls.save();

  await logAuditEvent({
    event: AUTH_EVENTS.CLASS_UPDATED,
    userId: user.id,
    schoolId: cls.schoolId,
    entityType: 'Class',
    entityId: cls._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return cls.toJSON();
}

export async function deleteClass(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid class ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const cls = await Class.findOne(query);
  if (!cls) {
    throw AppError.notFound('Class not found');
  }

  cls.isDeleted = true;
  cls.deletedAt = new Date();
  cls.deletedBy = user.id;
  await cls.save();

  await logAuditEvent({
    event: AUTH_EVENTS.CLASS_DELETED,
    userId: user.id,
    schoolId: cls.schoolId,
    entityType: 'Class',
    entityId: cls._id,
    details: { name: cls.name, code: cls.code },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Class deleted successfully' };
}
