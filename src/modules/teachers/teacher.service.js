import mongoose from 'mongoose';
import Teacher from './teacher.model.js';
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

export async function createTeacher(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  // 1. Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // 2. Check duplicate employeeId in same school
  const existingEmployeeId = await Teacher.findOne({
    schoolId,
    employeeId: data.employeeId.trim().toUpperCase(),
  });
  if (existingEmployeeId) {
    throw AppError.conflict(
      `Teacher with employee ID '${data.employeeId.toUpperCase()}' already exists in this school`
    );
  }

  // 3. Verify userId if provided
  if (data.userId) {
    const userDoc = await User.findOne({ _id: data.userId, schoolId });
    if (!userDoc) {
      throw AppError.notFound('Linked user account not found in this school');
    }
    if (userDoc.role !== ROLES.TEACHER) {
      throw AppError.badRequest(`Linked user must have '${ROLES.TEACHER}' role`);
    }
  }

  const teacher = new Teacher({
    ...data,
    employeeId: data.employeeId.trim().toUpperCase(),
    email: data.email.toLowerCase().trim(),
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await teacher.save();

  await logAuditEvent({
    event: AUTH_EVENTS.TEACHER_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Teacher',
    entityId: teacher._id,
    details: {
      employeeId: teacher.employeeId,
      name: `${teacher.firstName} ${teacher.lastName}`,
      email: teacher.email,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return teacher.toJSON();
}

export async function getTeachers(params, user) {
  const {
    page = 1,
    limit = 10,
    employmentStatus,
    designation,
    gender,
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

  if (employmentStatus) query.employmentStatus = employmentStatus;
  if (designation) query.designation = designation;
  if (gender) query.gender = gender;

  if (search) {
    const searchRegex = { $regex: search, $options: 'i' };
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { employeeId: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [teachers, total] = await Promise.all([
    Teacher.find(query)
      .populate('userId', 'email firstName lastName role status')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Teacher.countDocuments(query),
  ]);

  return {
    teachers: teachers.map((t) => t.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getTeacherById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid teacher ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const teacher = await Teacher.findOne(query).populate(
    'userId',
    'email firstName lastName role status lastLoginAt'
  );
  if (!teacher) {
    throw AppError.notFound('Teacher not found');
  }

  return teacher.toJSON();
}

export async function updateTeacher(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid teacher ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const teacher = await Teacher.findOne(query);
  if (!teacher) {
    throw AppError.notFound('Teacher not found');
  }

  // Check duplicate employeeId if changed
  if (updates.employeeId && updates.employeeId.trim().toUpperCase() !== teacher.employeeId) {
    const existing = await Teacher.findOne({
      schoolId: teacher.schoolId,
      employeeId: updates.employeeId.trim().toUpperCase(),
      _id: { $ne: teacher._id },
    });
    if (existing) {
      throw AppError.conflict(
        `Teacher with employee ID '${updates.employeeId.toUpperCase()}' already exists`
      );
    }
    teacher.employeeId = updates.employeeId.trim().toUpperCase();
  }

  // Check userId if updated
  if (updates.userId) {
    const userDoc = await User.findOne({ _id: updates.userId, schoolId: teacher.schoolId });
    if (!userDoc) {
      throw AppError.notFound('Linked user account not found in this school');
    }
    if (userDoc.role !== ROLES.TEACHER) {
      throw AppError.badRequest(`Linked user must have '${ROLES.TEACHER}' role`);
    }
    teacher.userId = updates.userId;
  } else if (updates.userId === null) {
    teacher.userId = null;
  }

  if (updates.firstName) teacher.firstName = updates.firstName.trim();
  if (updates.lastName) teacher.lastName = updates.lastName.trim();
  if (updates.email) teacher.email = updates.email.toLowerCase().trim();
  if (updates.phone !== undefined) teacher.phone = updates.phone;
  if (updates.dateOfBirth !== undefined) teacher.dateOfBirth = updates.dateOfBirth;
  if (updates.gender) teacher.gender = updates.gender;
  if (updates.qualification !== undefined) teacher.qualification = updates.qualification;
  if (updates.specialization !== undefined) teacher.specialization = updates.specialization;
  if (updates.joiningDate !== undefined) teacher.joiningDate = updates.joiningDate;
  if (updates.designation !== undefined) teacher.designation = updates.designation;
  if (updates.profileImage !== undefined) teacher.profileImage = updates.profileImage;
  if (updates.employmentStatus) teacher.employmentStatus = updates.employmentStatus;

  teacher.updatedBy = user.id;
  await teacher.save();

  await logAuditEvent({
    event: AUTH_EVENTS.TEACHER_UPDATED,
    userId: user.id,
    schoolId: teacher.schoolId,
    entityType: 'Teacher',
    entityId: teacher._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return teacher.toJSON();
}

export async function deleteTeacher(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid teacher ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const teacher = await Teacher.findOne(query);
  if (!teacher) {
    throw AppError.notFound('Teacher not found');
  }

  teacher.isDeleted = true;
  teacher.deletedAt = new Date();
  teacher.deletedBy = user.id;
  await teacher.save();

  await logAuditEvent({
    event: AUTH_EVENTS.TEACHER_DELETED,
    userId: user.id,
    schoolId: teacher.schoolId,
    entityType: 'Teacher',
    entityId: teacher._id,
    details: { employeeId: teacher.employeeId, name: `${teacher.firstName} ${teacher.lastName}` },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Teacher deleted successfully' };
}
