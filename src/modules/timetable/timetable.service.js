import mongoose from 'mongoose';
import Timetable from './timetable.model.js';
import AcademicSession from '../academics/academicSession.model.js';
import Class from '../academics/class.model.js';
import Section from '../academics/section.model.js';
import Subject from '../academics/subject.model.js';
import Teacher from '../teachers/teacher.model.js';
import Student from '../students/student.model.js';
import Parent from '../parents/parent.model.js';
import StudentParent from '../parents/studentParent.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { logAuditEvent } from '../audit/audit.service.js';
import { AUTH_EVENTS, ROLES } from '../../constants/index.js';

export async function detectCollisions({
  schoolId,
  academicSessionId,
  sectionId,
  teacherId,
  room,
  dayOfWeek,
  periodNumber,
  excludeId = null,
}) {
  // 1. Section collision
  const sectionQuery = {
    schoolId,
    academicSessionId,
    sectionId,
    dayOfWeek,
    periodNumber,
  };
  if (excludeId) sectionQuery._id = { $ne: excludeId };
  const sectionConflict = await Timetable.findOne(sectionQuery);
  if (sectionConflict) {
    throw AppError.conflict(
      `Section collision: Section is already scheduled for period ${periodNumber} on ${dayOfWeek}`
    );
  }

  // 2. Teacher collision
  const teacherQuery = {
    schoolId,
    academicSessionId,
    teacherId,
    dayOfWeek,
    periodNumber,
  };
  if (excludeId) teacherQuery._id = { $ne: excludeId };
  const teacherConflict = await Timetable.findOne(teacherQuery);
  if (teacherConflict) {
    throw AppError.conflict(
      `Teacher collision: Teacher is already scheduled for another section in period ${periodNumber} on ${dayOfWeek}`
    );
  }

  // 3. Room collision (if room specified)
  if (room && room.trim().length > 0) {
    const roomQuery = {
      schoolId,
      academicSessionId,
      room: room.trim(),
      dayOfWeek,
      periodNumber,
    };
    if (excludeId) roomQuery._id = { $ne: excludeId };
    const roomConflict = await Timetable.findOne(roomQuery);
    if (roomConflict) {
      throw AppError.conflict(
        `Room collision: Room '${room}' is already occupied during period ${periodNumber} on ${dayOfWeek}`
      );
    }
  }
}

export async function createTimetableEntry(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) {
    throw AppError.badRequest('School ID is required for timetable management');
  }

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found or inactive');
  }

  // Validate entities belong to same school
  const [session, cls, section, subject, teacher] = await Promise.all([
    AcademicSession.findOne({ _id: data.academicSessionId, schoolId }),
    Class.findOne({ _id: data.classId, schoolId }),
    Section.findOne({ _id: data.sectionId, classId: data.classId, schoolId }),
    Subject.findOne({ _id: data.subjectId, schoolId }),
    Teacher.findOne({ _id: data.teacherId, schoolId }),
  ]);

  if (!session) throw AppError.notFound('Academic session not found in this school');
  if (!cls) throw AppError.notFound('Class not found in this school');
  if (!section) throw AppError.notFound('Section not found in this class/school');
  if (!subject) throw AppError.notFound('Subject not found in this school');
  if (!teacher) throw AppError.notFound('Teacher not found in this school');

  // Check 3-way collisions
  await detectCollisions({
    schoolId,
    academicSessionId: data.academicSessionId,
    sectionId: data.sectionId,
    teacherId: data.teacherId,
    room: data.room,
    dayOfWeek: data.dayOfWeek,
    periodNumber: data.periodNumber,
  });

  const entry = new Timetable({
    ...data,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await entry.save();

  await logAuditEvent({
    event: AUTH_EVENTS.TIMETABLE_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Timetable',
    entityId: entry._id,
    details: { sectionId: data.sectionId, teacherId: data.teacherId, dayOfWeek: data.dayOfWeek, periodNumber: data.periodNumber },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return entry.toJSON();
}

export async function getTimetableList(filters, user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  } else if (filters.schoolId) {
    query.schoolId = filters.schoolId;
  }

  if (filters.academicSessionId) query.academicSessionId = filters.academicSessionId;
  if (filters.classId) query.classId = filters.classId;
  if (filters.sectionId) query.sectionId = filters.sectionId;
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.teacherId) query.teacherId = filters.teacherId;
  if (filters.dayOfWeek) query.dayOfWeek = filters.dayOfWeek;
  if (filters.room) query.room = filters.room;

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const [entries, total] = await Promise.all([
    Timetable.find(query)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName')
      .sort({ dayOfWeek: 1, periodNumber: 1 })
      .skip(skip)
      .limit(limit),
    Timetable.countDocuments(query),
  ]);

  return {
    timetable: entries.map((e) => e.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getSectionTimetable(sectionId, user) {
  if (!mongoose.Types.ObjectId.isValid(sectionId)) {
    throw AppError.badRequest('Invalid section ID format');
  }

  const query = { sectionId };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  // Student check: must belong to section
  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!student || student.sectionId.toString() !== sectionId) {
      throw AppError.forbidden('Students can only access their own section timetable');
    }
  }

  // Parent check: must have linked child in section
  if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!parent) {
      throw AppError.forbidden('Parent profile not found');
    }
    const links = await StudentParent.find({ parentId: parent._id, schoolId: user.schoolId });
    const studentIds = links.map((l) => l.studentId);
    const studentInSection = await Student.findOne({ _id: { $in: studentIds }, sectionId, schoolId: user.schoolId });
    if (!studentInSection) {
      throw AppError.forbidden('Parents can only view timetables for sections of their linked children');
    }
  }

  const entries = await Timetable.find(query)
    .populate('subjectId', 'name code')
    .populate('teacherId', 'firstName lastName')
    .sort({ dayOfWeek: 1, periodNumber: 1 });

  return entries.map((e) => e.toJSON());
}

export async function getTeacherTimetable(teacherId, user) {
  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    throw AppError.badRequest('Invalid teacher ID format');
  }

  const query = { teacherId };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  if (user.role === ROLES.TEACHER) {
    const teacher = await Teacher.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!teacher || teacher._id.toString() !== teacherId) {
      throw AppError.forbidden('Teachers can only access their own timetable');
    }
  }

  const entries = await Timetable.find(query)
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name code')
    .sort({ dayOfWeek: 1, periodNumber: 1 });

  return entries.map((e) => e.toJSON());
}

export async function updateTimetableEntry(id, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid timetable ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const entry = await Timetable.findOne(query);
  if (!entry) {
    throw AppError.notFound('Timetable entry not found');
  }

  const teacherId = data.teacherId || entry.teacherId;
  const dayOfWeek = data.dayOfWeek || entry.dayOfWeek;
  const periodNumber = data.periodNumber !== undefined ? data.periodNumber : entry.periodNumber;
  const room = data.room !== undefined ? data.room : entry.room;

  // Collision check
  await detectCollisions({
    schoolId: entry.schoolId,
    academicSessionId: entry.academicSessionId,
    sectionId: entry.sectionId,
    teacherId,
    room,
    dayOfWeek,
    periodNumber,
    excludeId: entry._id,
  });

  Object.assign(entry, data);
  entry.updatedBy = user.id;
  await entry.save();

  await logAuditEvent({
    event: AUTH_EVENTS.TIMETABLE_UPDATED,
    userId: user.id,
    schoolId: entry.schoolId,
    entityType: 'Timetable',
    entityId: entry._id,
    details: { changes: Object.keys(data) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return entry.toJSON();
}

export async function deleteTimetableEntry(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid timetable ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const entry = await Timetable.findOne(query);
  if (!entry) {
    throw AppError.notFound('Timetable entry not found');
  }

  entry.isDeleted = true;
  entry.deletedAt = new Date();
  entry.deletedBy = user.id;
  await entry.save();

  await logAuditEvent({
    event: AUTH_EVENTS.TIMETABLE_DELETED,
    userId: user.id,
    schoolId: entry.schoolId,
    entityType: 'Timetable',
    entityId: entry._id,
    details: { deletedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Timetable entry deleted successfully' };
}
