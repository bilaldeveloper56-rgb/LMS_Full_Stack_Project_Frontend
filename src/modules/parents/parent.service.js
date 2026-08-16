import mongoose from 'mongoose';
import Parent from './parent.model.js';
import StudentParent from './studentParent.model.js';
import User from '../users/user.model.js';
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

export async function createParent(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  // 1. Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // 2. Verify userId if supplied
  if (data.userId) {
    const userDoc = await User.findOne({ _id: data.userId, schoolId });
    if (!userDoc) {
      throw AppError.notFound('Linked user account not found in this school');
    }
    if (userDoc.role !== ROLES.PARENT) {
      throw AppError.badRequest(`Linked user must have '${ROLES.PARENT}' role`);
    }
  }

  const parent = new Parent({
    ...data,
    email: data.email.toLowerCase().trim(),
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await parent.save();

  await logAuditEvent({
    event: AUTH_EVENTS.PARENT_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Parent',
    entityId: parent._id,
    details: { name: `${parent.firstName} ${parent.lastName}`, email: parent.email },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return parent.toJSON();
}

export async function getParents(params, user) {
  const {
    page = 1,
    limit = 10,
    search,
    schoolId: querySchoolId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [parents, total] = await Promise.all([
    Parent.find(query)
      .populate('userId', 'email firstName lastName role status')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Parent.countDocuments(query),
  ]);

  return {
    parents: parents.map((p) => p.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getParentById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid parent ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const parent = await Parent.findOne(query).populate('userId', 'email firstName lastName role status');
  if (!parent) {
    throw AppError.notFound('Parent not found');
  }

  return parent.toJSON();
}

export async function updateParent(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid parent ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const parent = await Parent.findOne(query);
  if (!parent) {
    throw AppError.notFound('Parent not found');
  }

  // Verify userId if updated
  if (updates.userId) {
    const userDoc = await User.findOne({ _id: updates.userId, schoolId: parent.schoolId });
    if (!userDoc) {
      throw AppError.notFound('Linked user account not found in this school');
    }
    if (userDoc.role !== ROLES.PARENT) {
      throw AppError.badRequest(`Linked user must have '${ROLES.PARENT}' role`);
    }
    parent.userId = updates.userId;
  } else if (updates.userId === null) {
    parent.userId = null;
  }

  if (updates.firstName) parent.firstName = updates.firstName.trim();
  if (updates.lastName) parent.lastName = updates.lastName.trim();
  if (updates.email) parent.email = updates.email.toLowerCase().trim();
  if (updates.phone) parent.phone = updates.phone.trim();
  if (updates.alternatePhone !== undefined) parent.alternatePhone = updates.alternatePhone;
  if (updates.address !== undefined) parent.address = updates.address;
  if (updates.occupation !== undefined) parent.occupation = updates.occupation;
  if (updates.relationship !== undefined) parent.relationship = updates.relationship;

  parent.updatedBy = user.id;
  await parent.save();

  await logAuditEvent({
    event: AUTH_EVENTS.PARENT_UPDATED,
    userId: user.id,
    schoolId: parent.schoolId,
    entityType: 'Parent',
    entityId: parent._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return parent.toJSON();
}

export async function deleteParent(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid parent ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const parent = await Parent.findOne(query);
  if (!parent) {
    throw AppError.notFound('Parent not found');
  }

  parent.isDeleted = true;
  parent.deletedAt = new Date();
  parent.deletedBy = user.id;
  await parent.save();

  await logAuditEvent({
    event: AUTH_EVENTS.PARENT_DELETED,
    userId: user.id,
    schoolId: parent.schoolId,
    entityType: 'Parent',
    entityId: parent._id,
    details: { name: `${parent.firstName} ${parent.lastName}` },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Parent deleted successfully' };
}

export async function getParentChildren(parentId, user) {
  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    throw AppError.badRequest('Invalid parent ID format');
  }

  const parentQuery = { _id: parentId };
  if (user.role !== ROLES.SUPER_ADMIN) {
    parentQuery.schoolId = user.schoolId;
  }

  const parent = await Parent.findOne(parentQuery);
  if (!parent) {
    throw AppError.notFound('Parent not found');
  }

  const links = await StudentParent.find({
    schoolId: parent.schoolId,
    parentId: parent._id,
  }).populate({
    path: 'studentId',
    populate: [
      { path: 'classId', select: 'name code' },
      { path: 'sectionId', select: 'name code' },
      { path: 'academicSessionId', select: 'name status' },
    ],
  });

  return links.map((link) => ({
    relationshipType: link.relationshipType,
    isPrimary: link.isPrimary,
    canReceiveNotifications: link.canReceiveNotifications,
    canViewAcademicRecords: link.canViewAcademicRecords,
    student: link.studentId ? link.studentId.toJSON() : null,
  }));
}
