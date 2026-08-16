import mongoose from 'mongoose';
import StudentParent from './studentParent.model.js';
import Parent from './parent.model.js';
import Student from '../students/student.model.js';
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

export async function createStudentParentLink(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  // 1. Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // 2. Verify student exists in this school
  const student = await Student.findOne({ _id: data.studentId, schoolId });
  if (!student) {
    throw AppError.notFound('Student not found in this school');
  }

  // 3. Verify parent exists in this school
  const parent = await Parent.findOne({ _id: data.parentId, schoolId });
  if (!parent) {
    throw AppError.notFound('Parent not found in this school');
  }

  // 4. Check duplicate link
  const existing = await StudentParent.findOne({
    schoolId,
    studentId: data.studentId,
    parentId: data.parentId,
  });
  if (existing) {
    throw AppError.conflict('This parent is already linked to this student');
  }

  // 5. If isPrimary, unset other primary parents for this student
  if (data.isPrimary) {
    await StudentParent.updateMany(
      { schoolId, studentId: data.studentId },
      { isPrimary: false }
    );
  }

  const link = new StudentParent({
    ...data,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await link.save();

  await logAuditEvent({
    event: AUTH_EVENTS.STUDENT_PARENT_LINKED,
    userId: user.id,
    schoolId,
    entityType: 'StudentParent',
    entityId: link._id,
    details: {
      studentId: link.studentId,
      parentId: link.parentId,
      relationshipType: link.relationshipType,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return link.toJSON();
}

export async function getStudentParentLinks(params, user) {
  const {
    page = 1,
    limit = 10,
    studentId,
    parentId,
    relationshipType,
    schoolId: querySchoolId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  if (studentId) query.studentId = studentId;
  if (parentId) query.parentId = parentId;
  if (relationshipType) query.relationshipType = relationshipType;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [links, total] = await Promise.all([
    StudentParent.find(query)
      .populate('studentId', 'firstName lastName admissionNumber rollNumber')
      .populate('parentId', 'firstName lastName email phone relationship')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    StudentParent.countDocuments(query),
  ]);

  return {
    links: links.map((l) => l.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function updateStudentParentLink(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid link ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const link = await StudentParent.findOne(query);
  if (!link) {
    throw AppError.notFound('Student-parent link not found');
  }

  if (updates.isPrimary) {
    await StudentParent.updateMany(
      { schoolId: link.schoolId, studentId: link.studentId, _id: { $ne: link._id } },
      { isPrimary: false }
    );
    link.isPrimary = true;
  } else if (updates.isPrimary === false) {
    link.isPrimary = false;
  }

  if (updates.relationshipType) link.relationshipType = updates.relationshipType;
  if (updates.canReceiveNotifications !== undefined) link.canReceiveNotifications = updates.canReceiveNotifications;
  if (updates.canViewAcademicRecords !== undefined) link.canViewAcademicRecords = updates.canViewAcademicRecords;

  link.updatedBy = user.id;
  await link.save();

  await logAuditEvent({
    event: AUTH_EVENTS.STUDENT_PARENT_UPDATED,
    userId: user.id,
    schoolId: link.schoolId,
    entityType: 'StudentParent',
    entityId: link._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return link.toJSON();
}

export async function deleteStudentParentLink(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid link ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const link = await StudentParent.findOne(query);
  if (!link) {
    throw AppError.notFound('Student-parent link not found');
  }

  await StudentParent.findByIdAndDelete(link._id);

  await logAuditEvent({
    event: AUTH_EVENTS.STUDENT_PARENT_UNLINKED,
    userId: user.id,
    schoolId: link.schoolId,
    entityType: 'StudentParent',
    entityId: link._id,
    details: { studentId: link.studentId, parentId: link.parentId },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Student-parent link removed successfully' };
}

export async function getStudentParents(studentId, user) {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw AppError.badRequest('Invalid student ID format');
  }

  const studentQuery = { _id: studentId };
  if (user.role !== ROLES.SUPER_ADMIN) {
    studentQuery.schoolId = user.schoolId;
  }

  const student = await Student.findOne(studentQuery);
  if (!student) {
    throw AppError.notFound('Student not found');
  }

  const links = await StudentParent.find({
    schoolId: student.schoolId,
    studentId: student._id,
  }).populate('parentId', 'firstName lastName email phone alternatePhone occupation relationship');

  return links.map((link) => ({
    relationshipType: link.relationshipType,
    isPrimary: link.isPrimary,
    canReceiveNotifications: link.canReceiveNotifications,
    canViewAcademicRecords: link.canViewAcademicRecords,
    parent: link.parentId ? link.parentId.toJSON() : null,
  }));
}
