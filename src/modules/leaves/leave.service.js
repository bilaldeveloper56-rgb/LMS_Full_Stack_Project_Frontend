import mongoose from 'mongoose';
import Leave from './leave.model.js';
import Student from '../students/student.model.js';
import Teacher from '../teachers/teacher.model.js';
import Parent from '../parents/parent.model.js';
import StudentParent from '../parents/studentParent.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import {
  ROLES,
  AUTH_EVENTS,
  LEAVE_STATUS,
} from '../../constants/index.js';
import { logAuditEvent } from '../audit/audit.service.js';

function resolveSchoolId(user, explicitSchoolId) {
  if (user.role === ROLES.SUPER_ADMIN) {
    return explicitSchoolId || user.schoolId || null;
  }
  return user.schoolId;
}

export async function createLeave(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  let studentId = data.studentId || null;
  let teacherId = data.teacherId || null;

  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: user.id, schoolId });
    if (!student) {
      throw AppError.notFound('Student profile not found for this user account');
    }
    studentId = student._id;
    teacherId = null;
  } else if (user.role === ROLES.TEACHER) {
    const teacher = await Teacher.findOne({ userId: user.id, schoolId });
    if (!teacher) {
      throw AppError.notFound('Teacher profile not found for this user account');
    }
    teacherId = teacher._id;
    studentId = null;
  } else if (user.role === ROLES.PARENT && studentId) {
    const parent = await Parent.findOne({ userId: user.id, schoolId });
    if (!parent) {
      throw AppError.forbidden('Parent profile not found');
    }
    const link = await StudentParent.findOne({ schoolId, parentId: parent._id, studentId });
    if (!link) {
      throw AppError.forbidden('Parents can only submit leave for their linked children');
    }
  } else if (studentId) {
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      throw AppError.notFound('Student not found in this school');
    }
  } else if (teacherId) {
    const teacher = await Teacher.findOne({ _id: teacherId, schoolId });
    if (!teacher) {
      throw AppError.notFound('Teacher not found in this school');
    }
  }

  const leave = new Leave({
    ...data,
    schoolId,
    applicantUserId: user.id,
    studentId,
    teacherId,
    status: LEAVE_STATUS.PENDING,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await leave.save();

  await logAuditEvent({
    event: AUTH_EVENTS.LEAVE_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Leave',
    entityId: leave._id,
    details: {
      leaveType: leave.leaveType,
      dayType: leave.dayType,
      startDate: leave.startDate,
      endDate: leave.endDate,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return leave.toJSON();
}

export async function listLeaves(params, user) {
  const {
    page = 1,
    limit = 20,
    status,
    leaveType,
    dayType,
    studentId,
    teacherId,
    applicantUserId,
    startDate,
    endDate,
    schoolId: querySchoolId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  // Role based filtering
  if (user.role === ROLES.STUDENT) {
    query.applicantUserId = user.id;
  } else if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId: targetSchoolId });
    if (parent) {
      const links = await StudentParent.find({ schoolId: targetSchoolId, parentId: parent._id });
      query.studentId = { $in: links.map((l) => l.studentId) };
    }
  }

  if (status) query.status = status;
  if (leaveType) query.leaveType = leaveType;
  if (dayType) query.dayType = dayType;
  if (studentId) query.studentId = studentId;
  if (teacherId) query.teacherId = teacherId;
  if (applicantUserId) query.applicantUserId = applicantUserId;

  if (startDate || endDate) {
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    } else if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [leaves, total] = await Promise.all([
    Leave.find(query)
      .populate('applicantUserId', 'firstName lastName email role')
      .populate('studentId', 'firstName lastName admissionNumber rollNumber')
      .populate('teacherId', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName email')
      .populate('rejectedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Leave.countDocuments(query),
  ]);

  return {
    leaves: leaves.map((l) => l.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getLeaveById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid leave ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const leave = await Leave.findOne(query)
    .populate('applicantUserId', 'firstName lastName email role')
    .populate('studentId', 'firstName lastName admissionNumber rollNumber')
    .populate('teacherId', 'firstName lastName employeeId')
    .populate('approvedBy', 'firstName lastName email')
    .populate('rejectedBy', 'firstName lastName email');

  if (!leave) {
    throw AppError.notFound('Leave request not found');
  }

  if (user.role === ROLES.STUDENT && leave.applicantUserId._id.toString() !== user.id) {
    throw AppError.forbidden('Students can only access their own leave requests');
  }

  return leave.toJSON();
}

export async function updateLeave(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid leave ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const leave = await Leave.findOne(query);
  if (!leave) {
    throw AppError.notFound('Leave request not found');
  }

  if (leave.status !== LEAVE_STATUS.PENDING) {
    throw AppError.badRequest(`Cannot modify leave request with status '${leave.status}'`);
  }

  // Only applicant or School Admin can edit a pending leave
  if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.SCHOOL_ADMIN && leave.applicantUserId.toString() !== user.id) {
    throw AppError.forbidden('You are not authorized to update this leave request');
  }

  if (updates.leaveType) leave.leaveType = updates.leaveType;
  if (updates.dayType) leave.dayType = updates.dayType;
  if (updates.startDate) leave.startDate = new Date(updates.startDate);
  if (updates.endDate) leave.endDate = new Date(updates.endDate);
  if (updates.reason) leave.reason = updates.reason.trim();
  if (updates.attachmentUrl !== undefined) leave.attachmentUrl = updates.attachmentUrl;

  leave.updatedBy = user.id;
  await leave.save();

  await logAuditEvent({
    event: AUTH_EVENTS.LEAVE_UPDATED,
    userId: user.id,
    schoolId: leave.schoolId,
    entityType: 'Leave',
    entityId: leave._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return leave.toJSON();
}

export async function cancelLeave(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid leave ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const leave = await Leave.findOne(query);
  if (!leave) {
    throw AppError.notFound('Leave request not found');
  }

  if (leave.status !== LEAVE_STATUS.PENDING) {
    throw AppError.badRequest(`Cannot cancel leave request with status '${leave.status}'`);
  }

  // Only applicant or School Admin can cancel
  if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.SCHOOL_ADMIN && leave.applicantUserId.toString() !== user.id) {
    throw AppError.forbidden('You are not authorized to cancel this leave request');
  }

  leave.status = LEAVE_STATUS.CANCELLED;
  leave.cancelledAt = new Date();
  leave.updatedBy = user.id;
  await leave.save();

  await logAuditEvent({
    event: AUTH_EVENTS.LEAVE_CANCELLED,
    userId: user.id,
    schoolId: leave.schoolId,
    entityType: 'Leave',
    entityId: leave._id,
    details: { previousStatus: LEAVE_STATUS.PENDING },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return leave.toJSON();
}

export async function approveLeave(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid leave ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const leave = await Leave.findOne(query);
  if (!leave) {
    throw AppError.notFound('Leave request not found');
  }

  if (leave.status !== LEAVE_STATUS.PENDING) {
    throw AppError.badRequest(`Only pending leave requests can be approved. Current status: '${leave.status}'`);
  }

  // CRITICAL RULE: Users cannot approve their own leave
  if (leave.applicantUserId.toString() === user.id) {
    throw AppError.forbidden('Users cannot approve their own leave requests');
  }

  // Role validation: Student cannot approve leaves
  if (user.role === ROLES.STUDENT || user.role === ROLES.PARENT) {
    throw AppError.forbidden('You are not authorized to approve leave requests');
  }

  // Teachers can only approve student leaves, not teacher leaves
  if (user.role === ROLES.TEACHER && leave.teacherId) {
    throw AppError.forbidden('Teachers cannot approve other teachers leave requests');
  }

  leave.status = LEAVE_STATUS.APPROVED;
  leave.approvedBy = user.id;
  leave.approvedAt = new Date();
  leave.updatedBy = user.id;
  await leave.save();

  await logAuditEvent({
    event: AUTH_EVENTS.LEAVE_APPROVED,
    userId: user.id,
    schoolId: leave.schoolId,
    entityType: 'Leave',
    entityId: leave._id,
    details: { approvedBy: user.id, applicantUserId: leave.applicantUserId },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return leave.toJSON();
}

export async function rejectLeave(id, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid leave ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const leave = await Leave.findOne(query);
  if (!leave) {
    throw AppError.notFound('Leave request not found');
  }

  if (leave.status !== LEAVE_STATUS.PENDING) {
    throw AppError.badRequest(`Only pending leave requests can be rejected. Current status: '${leave.status}'`);
  }

  // Users cannot reject their own leave (use cancel instead)
  if (leave.applicantUserId.toString() === user.id) {
    throw AppError.forbidden('Users cannot reject their own leave requests. Use cancel instead.');
  }

  // Role validation
  if (user.role === ROLES.STUDENT || user.role === ROLES.PARENT) {
    throw AppError.forbidden('You are not authorized to reject leave requests');
  }

  if (user.role === ROLES.TEACHER && leave.teacherId) {
    throw AppError.forbidden('Teachers cannot reject other teachers leave requests');
  }

  leave.status = LEAVE_STATUS.REJECTED;
  leave.rejectedBy = user.id;
  leave.rejectedAt = new Date();
  leave.rejectionReason = data.rejectionReason.trim();
  leave.updatedBy = user.id;
  await leave.save();

  await logAuditEvent({
    event: AUTH_EVENTS.LEAVE_REJECTED,
    userId: user.id,
    schoolId: leave.schoolId,
    entityType: 'Leave',
    entityId: leave._id,
    details: { rejectedBy: user.id, rejectionReason: data.rejectionReason },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return leave.toJSON();
}

export async function deleteLeave(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid leave ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const leave = await Leave.findOne(query);
  if (!leave) {
    throw AppError.notFound('Leave request not found');
  }

  leave.isDeleted = true;
  leave.deletedAt = new Date();
  leave.deletedBy = user.id;
  await leave.save();

  await logAuditEvent({
    event: AUTH_EVENTS.LEAVE_DELETED,
    userId: user.id,
    schoolId: leave.schoolId,
    entityType: 'Leave',
    entityId: leave._id,
    details: { leaveType: leave.leaveType },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Leave request deleted successfully' };
}

export async function getMyLeaves(params, user) {
  return listLeaves({ ...params, applicantUserId: user.id }, user);
}

export async function getStudentLeaves(studentId, params, user) {
  return listLeaves({ ...params, studentId }, user);
}

export async function getTeacherLeaves(teacherId, params, user) {
  return listLeaves({ ...params, teacherId }, user);
}
