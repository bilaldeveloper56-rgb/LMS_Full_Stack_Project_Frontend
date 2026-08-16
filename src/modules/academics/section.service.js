import mongoose from 'mongoose';
import Section from './section.model.js';
import Class from './class.model.js';
import AcademicSession from './academicSession.model.js';
import Teacher from '../teachers/teacher.model.js';
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

export async function createSection(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  // Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // Verify class exists in this school
  const cls = await Class.findOne({ _id: data.classId, schoolId });
  if (!cls) {
    throw AppError.notFound('Class not found in this school');
  }

  const academicSessionId = data.academicSessionId || cls.academicSessionId;

  // Verify academic session
  const session = await AcademicSession.findOne({ _id: academicSessionId, schoolId });
  if (!session) {
    throw AppError.notFound('Academic session not found in this school');
  }

  // Verify classTeacherId if supplied
  if (data.classTeacherId) {
    const teacher = await Teacher.findOne({ _id: data.classTeacherId, schoolId });
    if (!teacher) {
      throw AppError.notFound('Class teacher not found in this school');
    }
  }

  // Check duplicate section code in class + session
  const existing = await Section.findOne({
    schoolId,
    classId: data.classId,
    academicSessionId,
    code: data.code.trim().toUpperCase(),
  });
  if (existing) {
    throw AppError.conflict(
      `Section with code '${data.code.toUpperCase()}' already exists in this class`
    );
  }

  const section = new Section({
    ...data,
    code: data.code.trim().toUpperCase(),
    academicSessionId,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await section.save();

  await logAuditEvent({
    event: AUTH_EVENTS.SECTION_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Section',
    entityId: section._id,
    details: { name: section.name, code: section.code, classId: section.classId },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return section.toJSON();
}

export async function getSections(params, user) {
  const {
    page = 1,
    limit = 10,
    classId,
    academicSessionId,
    classTeacherId,
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

  if (classId) {
    query.classId = classId;
  }

  if (academicSessionId) {
    query.academicSessionId = academicSessionId;
  }

  if (classTeacherId) {
    query.classTeacherId = classTeacherId;
  }

  if (typeof isActive === 'boolean') {
    query.isActive = isActive;
  }

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = [{ name: searchRegex }, { code: searchRegex }, { room: searchRegex }];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [sections, total] = await Promise.all([
    Section.find(query)
      .populate('classId', 'name code')
      .populate('academicSessionId', 'name status')
      .populate('classTeacherId', 'firstName lastName employeeId')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Section.countDocuments(query),
  ]);

  return {
    sections: sections.map((s) => s.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getSectionById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid section ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const section = await Section.findOne(query)
    .populate('classId', 'name code')
    .populate('academicSessionId', 'name status')
    .populate('classTeacherId', 'firstName lastName employeeId email');

  if (!section) {
    throw AppError.notFound('Section not found');
  }

  return section.toJSON();
}

export async function updateSection(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid section ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const section = await Section.findOne(query);
  if (!section) {
    throw AppError.notFound('Section not found');
  }

  // Check duplicate code if code changed
  if (updates.code && updates.code.trim().toUpperCase() !== section.code) {
    const existing = await Section.findOne({
      schoolId: section.schoolId,
      classId: section.classId,
      academicSessionId: section.academicSessionId,
      code: updates.code.trim().toUpperCase(),
      _id: { $ne: section._id },
    });
    if (existing) {
      throw AppError.conflict(
        `Section with code '${updates.code.toUpperCase()}' already exists in this class`
      );
    }
    section.code = updates.code.trim().toUpperCase();
  }

  // Check classTeacherId if updated
  if (updates.classTeacherId) {
    const teacher = await Teacher.findOne({
      _id: updates.classTeacherId,
      schoolId: section.schoolId,
    });
    if (!teacher) {
      throw AppError.notFound('Teacher not found in this school');
    }
    section.classTeacherId = updates.classTeacherId;
  } else if (updates.classTeacherId === null) {
    section.classTeacherId = null;
  }

  if (updates.name) section.name = updates.name.trim();
  if (updates.capacity !== undefined) section.capacity = updates.capacity;
  if (updates.room !== undefined) section.room = updates.room;
  if (updates.isActive !== undefined) section.isActive = updates.isActive;

  section.updatedBy = user.id;
  await section.save();

  await logAuditEvent({
    event: AUTH_EVENTS.SECTION_UPDATED,
    userId: user.id,
    schoolId: section.schoolId,
    entityType: 'Section',
    entityId: section._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return section.toJSON();
}

export async function deleteSection(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid section ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const section = await Section.findOne(query);
  if (!section) {
    throw AppError.notFound('Section not found');
  }

  section.isDeleted = true;
  section.deletedAt = new Date();
  section.deletedBy = user.id;
  await section.save();

  await logAuditEvent({
    event: AUTH_EVENTS.SECTION_DELETED,
    userId: user.id,
    schoolId: section.schoolId,
    entityType: 'Section',
    entityId: section._id,
    details: { name: section.name, code: section.code },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Section deleted successfully' };
}
