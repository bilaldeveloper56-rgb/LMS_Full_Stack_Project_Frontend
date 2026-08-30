import mongoose from 'mongoose';
import AcademicSession from './academicSession.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { ROLES, SESSION_STATUS, AUTH_EVENTS } from '../../constants/index.js';
import { logAuditEvent } from '../audit/audit.service.js';

function resolveSchoolId(user, explicitSchoolId) {
  if (user.role === ROLES.SUPER_ADMIN) {
    return explicitSchoolId || user.schoolId || null;
  }
  return user.schoolId;
}

export async function createAcademicSession(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  // Verify school existence
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // Check duplicate name within school
  const existing = await AcademicSession.findOne({
    schoolId,
    name: data.name.trim(),
  });
  if (existing) {
    throw AppError.conflict(`Academic session with name '${data.name}' already exists in this school`);
  }

  // If marked current or ACTIVE, transition previous active/current sessions to COMPLETED & not current
  if (data.isCurrent || data.status === SESSION_STATUS.ACTIVE) {
    await AcademicSession.updateMany(
      { schoolId, $or: [{ isCurrent: true }, { status: SESSION_STATUS.ACTIVE }] },
      { isCurrent: false, status: SESSION_STATUS.COMPLETED }
    );
  }

  const session = new AcademicSession({
    ...data,
    ...(data.status === SESSION_STATUS.ACTIVE ? { isCurrent: true } : {}),
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await session.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ACADEMIC_SESSION_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'AcademicSession',
    entityId: session._id,
    details: { name: session.name, status: session.status, isCurrent: session.isCurrent },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return session.toJSON();
}

export async function getAcademicSessions(params, user) {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    isCurrent,
    schoolId: querySchoolId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  if (status) {
    query.status = status;
  }

  if (typeof isCurrent === 'boolean') {
    query.isCurrent = isCurrent;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [sessions, total] = await Promise.all([
    AcademicSession.find(query).sort(sort).skip(skip).limit(limit),
    AcademicSession.countDocuments(query),
  ]);

  return {
    sessions: sessions.map((s) => s.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getAcademicSessionById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid academic session ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const session = await AcademicSession.findOne(query);
  if (!session) {
    throw AppError.notFound('Academic session not found');
  }

  return session.toJSON();
}

export async function updateAcademicSession(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid academic session ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const session = await AcademicSession.findOne(query);
  if (!session) {
    throw AppError.notFound('Academic session not found');
  }

  // Prevent duplicate name if name changed
  if (updates.name && updates.name.trim() !== session.name) {
    const existing = await AcademicSession.findOne({
      schoolId: session.schoolId,
      name: updates.name.trim(),
      _id: { $ne: session._id },
    });
    if (existing) {
      throw AppError.conflict(`Academic session with name '${updates.name}' already exists`);
    }
    session.name = updates.name.trim();
  }

  if (updates.startDate) session.startDate = new Date(updates.startDate);
  if (updates.endDate) session.endDate = new Date(updates.endDate);
  if (updates.status) session.status = updates.status;

  if (updates.isCurrent || updates.status === SESSION_STATUS.ACTIVE) {
    await AcademicSession.updateMany(
      { schoolId: session.schoolId, _id: { $ne: session._id }, $or: [{ isCurrent: true }, { status: SESSION_STATUS.ACTIVE }] },
      { isCurrent: false, status: SESSION_STATUS.COMPLETED }
    );
    if (updates.status === SESSION_STATUS.ACTIVE) {
      session.isCurrent = true;
    } else if (updates.isCurrent) {
      session.isCurrent = true;
    }
  } else if (updates.isCurrent === false) {
    session.isCurrent = false;
  }

  session.updatedBy = user.id;
  await session.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ACADEMIC_SESSION_UPDATED,
    userId: user.id,
    schoolId: session.schoolId,
    entityType: 'AcademicSession',
    entityId: session._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return session.toJSON();
}

export async function deleteAcademicSession(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid academic session ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const session = await AcademicSession.findOne(query);
  if (!session) {
    throw AppError.notFound('Academic session not found');
  }

  session.isDeleted = true;
  session.deletedAt = new Date();
  session.deletedBy = user.id;
  await session.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ACADEMIC_SESSION_DELETED,
    userId: user.id,
    schoolId: session.schoolId,
    entityType: 'AcademicSession',
    entityId: session._id,
    details: { name: session.name },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Academic session deleted successfully' };
}

export async function changeSessionStatus(id, newStatus, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid academic session ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const session = await AcademicSession.findOne(query);
  if (!session) {
    throw AppError.notFound('Academic session not found');
  }

  const oldStatus = session.status;
  session.status = newStatus;
  session.updatedBy = user.id;

  if (newStatus === SESSION_STATUS.ACTIVE) {
    await AcademicSession.updateMany(
      { schoolId: session.schoolId, _id: { $ne: session._id }, $or: [{ isCurrent: true }, { status: SESSION_STATUS.ACTIVE }] },
      { isCurrent: false, status: SESSION_STATUS.COMPLETED }
    );
    session.isCurrent = true;
  }

  await session.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ACADEMIC_SESSION_STATUS_CHANGED,
    userId: user.id,
    schoolId: session.schoolId,
    entityType: 'AcademicSession',
    entityId: session._id,
    details: { oldStatus, newStatus },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return session.toJSON();
}

export async function setCurrentSession(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid academic session ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const session = await AcademicSession.findOne(query);
  if (!session) {
    throw AppError.notFound('Academic session not found');
  }

  await AcademicSession.updateMany(
    { schoolId: session.schoolId, _id: { $ne: session._id }, $or: [{ isCurrent: true }, { status: SESSION_STATUS.ACTIVE }] },
    { isCurrent: false, status: SESSION_STATUS.COMPLETED }
  );

  session.isCurrent = true;
  session.status = SESSION_STATUS.ACTIVE;
  session.updatedBy = user.id;
  await session.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ACADEMIC_SESSION_STATUS_CHANGED,
    userId: user.id,
    schoolId: session.schoolId,
    entityType: 'AcademicSession',
    entityId: session._id,
    details: { action: 'SET_CURRENT', isCurrent: true, status: SESSION_STATUS.ACTIVE },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return session.toJSON();
}
