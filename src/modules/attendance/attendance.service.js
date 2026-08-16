import mongoose from 'mongoose';
import Attendance from './attendance.model.js';
import Student from '../students/student.model.js';
import Enrollment from '../students/enrollment.model.js';
import AcademicSession from '../academics/academicSession.model.js';
import Class from '../academics/class.model.js';
import Section from '../academics/section.model.js';
import Teacher from '../teachers/teacher.model.js';
import TeacherAssignment from '../academics/teacherAssignment.model.js';
import Parent from '../parents/parent.model.js';
import StudentParent from '../parents/studentParent.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import {
  ROLES,
  AUTH_EVENTS,
  ATTENDANCE_STATUS,
} from '../../constants/index.js';
import { logAuditEvent } from '../audit/audit.service.js';

function resolveSchoolId(user, explicitSchoolId) {
  if (user.role === ROLES.SUPER_ADMIN) {
    return explicitSchoolId || user.schoolId || null;
  }
  return user.schoolId;
}

export function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw AppError.badRequest('Invalid date provided');
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export async function verifyTeacherAssignment(user, { schoolId, classId, sectionId }) {
  if (user.role !== ROLES.TEACHER) {
    return;
  }

  const teacher = await Teacher.findOne({ userId: user.id, schoolId });
  if (!teacher) {
    throw AppError.forbidden('Teacher profile not found for this user account');
  }

  // Check if assigned via TeacherAssignment
  const assignment = await TeacherAssignment.findOne({
    schoolId,
    teacherId: teacher._id,
    classId,
    sectionId,
  });

  // Check if assigned as class teacher in Section
  const classTeacherSection = await Section.findOne({
    _id: sectionId,
    classId,
    classTeacherId: teacher._id,
    schoolId,
  });

  if (!assignment && !classTeacherSection) {
    throw AppError.forbidden(
      'Teachers are authorized to mark or modify attendance only for their assigned classes and sections'
    );
  }
}

export async function verifyStudentAccess(user, studentId, schoolId) {
  if (user.role === ROLES.SUPER_ADMIN || user.role === ROLES.SCHOOL_ADMIN) {
    return;
  }

  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student || student.userId?.toString() !== user.id) {
      throw AppError.forbidden('Students can only access their own attendance records');
    }
    return;
  }

  if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId });
    if (!parent) {
      throw AppError.forbidden('Parent profile not found');
    }
    const link = await StudentParent.findOne({
      schoolId,
      parentId: parent._id,
      studentId,
    });
    if (!link) {
      throw AppError.forbidden('Parents can only view attendance for their linked children');
    }
    return;
  }

  if (user.role === ROLES.TEACHER) {
    const teacher = await Teacher.findOne({ userId: user.id, schoolId });
    if (!teacher) {
      throw AppError.forbidden('Teacher profile not found');
    }
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      throw AppError.notFound('Student not found');
    }

    const assignment = await TeacherAssignment.findOne({
      schoolId,
      teacherId: teacher._id,
      classId: student.classId,
      sectionId: student.sectionId,
    });
    const classTeacherSection = await Section.findOne({
      _id: student.sectionId,
      classId: student.classId,
      classTeacherId: teacher._id,
      schoolId,
    });

    if (!assignment && !classTeacherSection) {
      throw AppError.forbidden('Teachers can only view attendance for their assigned students');
    }
    return;
  }
}

export async function createAttendance(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  await verifyTeacherAssignment(user, {
    schoolId,
    classId: data.classId,
    sectionId: data.sectionId,
  });

  const session = await AcademicSession.findOne({ _id: data.academicSessionId, schoolId });
  if (!session) {
    throw AppError.notFound('Academic session not found in this school');
  }

  const cls = await Class.findOne({ _id: data.classId, schoolId });
  if (!cls) {
    throw AppError.notFound('Class not found in this school');
  }

  const section = await Section.findOne({ _id: data.sectionId, classId: data.classId, schoolId });
  if (!section) {
    throw AppError.notFound('Section not found or does not belong to the selected class');
  }

  const student = await Student.findOne({ _id: data.studentId, schoolId });
  if (!student) {
    throw AppError.notFound('Student not found in this school');
  }

  const normalizedDate = normalizeDate(data.date);

  // Check duplicate daily attendance
  const existing = await Attendance.findOne({
    schoolId,
    academicSessionId: data.academicSessionId,
    studentId: data.studentId,
    date: normalizedDate,
  });
  if (existing) {
    throw AppError.conflict('An attendance record already exists for this student on this date');
  }

  const attendance = new Attendance({
    ...data,
    date: normalizedDate,
    schoolId,
    markedBy: user.id,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await attendance.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ATTENDANCE_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Attendance',
    entityId: attendance._id,
    details: {
      studentId: attendance.studentId,
      date: attendance.date,
      status: attendance.status,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return attendance.toJSON();
}

export async function bulkMarkAttendance(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  await verifyTeacherAssignment(user, {
    schoolId,
    classId: data.classId,
    sectionId: data.sectionId,
  });

  const session = await AcademicSession.findOne({ _id: data.academicSessionId, schoolId });
  if (!session) {
    throw AppError.notFound('Academic session not found in this school');
  }

  const cls = await Class.findOne({ _id: data.classId, schoolId });
  if (!cls) {
    throw AppError.notFound('Class not found in this school');
  }

  const section = await Section.findOne({ _id: data.sectionId, classId: data.classId, schoolId });
  if (!section) {
    throw AppError.notFound('Section not found or does not belong to the selected class');
  }

  // Verify unique student IDs in the payload
  const studentIds = data.records.map((r) => r.studentId);
  const uniqueStudentIds = new Set(studentIds);
  if (uniqueStudentIds.size !== studentIds.length) {
    throw AppError.badRequest('Duplicate student IDs detected in bulk attendance payload');
  }

  // Verify all students belong to the school
  const validStudents = await Student.find({
    _id: { $in: studentIds },
    schoolId,
  });
  if (validStudents.length !== studentIds.length) {
    throw AppError.badRequest('One or more students do not belong to this school');
  }

  const normalizedDate = normalizeDate(data.date);

  // Check for any existing records on this date
  const existingRecords = await Attendance.find({
    schoolId,
    academicSessionId: data.academicSessionId,
    studentId: { $in: studentIds },
    date: normalizedDate,
  });

  if (existingRecords.length > 0) {
    throw AppError.conflict(
      `Attendance has already been marked for ${existingRecords.length} student(s) on this date`
    );
  }

  const docsToInsert = data.records.map((r) => ({
    schoolId,
    academicSessionId: data.academicSessionId,
    classId: data.classId,
    sectionId: data.sectionId,
    studentId: r.studentId,
    date: normalizedDate,
    status: r.status,
    remarks: r.remarks || null,
    checkInTime: r.checkInTime ? new Date(r.checkInTime) : null,
    checkOutTime: r.checkOutTime ? new Date(r.checkOutTime) : null,
    source: data.source || 'MANUAL',
    markedBy: user.id,
    createdBy: user.id,
    updatedBy: user.id,
  }));

  const inserted = await Attendance.insertMany(docsToInsert);

  await logAuditEvent({
    event: AUTH_EVENTS.ATTENDANCE_BULK_MARKED,
    userId: user.id,
    schoolId,
    entityType: 'Attendance',
    entityId: inserted[0]?._id,
    details: {
      classId: data.classId,
      sectionId: data.sectionId,
      date: normalizedDate,
      count: inserted.length,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return inserted.map((d) => d.toJSON());
}

export async function getAttendanceList(params, user) {
  const {
    page = 1,
    limit = 20,
    academicSessionId,
    classId,
    sectionId,
    studentId,
    status,
    source,
    date,
    startDate,
    endDate,
    schoolId: querySchoolId,
    sortBy = 'date',
    sortOrder = 'desc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  // Teacher role constraint: automatically filter or verify
  if (user.role === ROLES.TEACHER) {
    const teacher = await Teacher.findOne({ userId: user.id, schoolId: targetSchoolId });
    if (teacher) {
      const assignments = await TeacherAssignment.find({ schoolId: targetSchoolId, teacherId: teacher._id });
      const classTeacherSections = await Section.find({ schoolId: targetSchoolId, classTeacherId: teacher._id });
      const allowedSectionIds = [
        ...assignments.map((a) => a.sectionId.toString()),
        ...classTeacherSections.map((s) => s._id.toString()),
      ];
      if (allowedSectionIds.length > 0) {
        query.sectionId = { $in: allowedSectionIds };
      }
    }
  }

  // Student/Parent constraints
  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: user.id, schoolId: targetSchoolId });
    if (student) {
      query.studentId = student._id;
    }
  } else if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId: targetSchoolId });
    if (parent) {
      const links = await StudentParent.find({ schoolId: targetSchoolId, parentId: parent._id });
      query.studentId = { $in: links.map((l) => l.studentId) };
    }
  }

  if (academicSessionId) query.academicSessionId = academicSessionId;
  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;
  if (studentId) query.studentId = studentId;
  if (status) query.status = status;
  if (source) query.source = source;

  if (date) {
    query.date = normalizeDate(date);
  } else if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = normalizeDate(startDate);
    if (endDate) query.date.$lte = normalizeDate(endDate);
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [records, total] = await Promise.all([
    Attendance.find(query)
      .populate('studentId', 'firstName lastName admissionNumber rollNumber')
      .populate('classId', 'name code')
      .populate('sectionId', 'name code')
      .populate('markedBy', 'firstName lastName email')
      .populate('correctedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(query),
  ]);

  return {
    records: records.map((r) => r.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getAttendanceById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid attendance ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const record = await Attendance.findOne(query)
    .populate('studentId', 'firstName lastName admissionNumber rollNumber userId')
    .populate('classId', 'name code')
    .populate('sectionId', 'name code')
    .populate('markedBy', 'firstName lastName email')
    .populate('correctedBy', 'firstName lastName email');

  if (!record) {
    throw AppError.notFound('Attendance record not found');
  }

  await verifyStudentAccess(user, record.studentId._id || record.studentId, record.schoolId);

  return record.toJSON();
}

export async function updateAttendance(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid attendance ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const record = await Attendance.findOne(query);
  if (!record) {
    throw AppError.notFound('Attendance record not found');
  }

  await verifyTeacherAssignment(user, {
    schoolId: record.schoolId,
    classId: record.classId,
    sectionId: record.sectionId,
  });

  if (updates.status) record.status = updates.status;
  if (updates.remarks !== undefined) record.remarks = updates.remarks;
  if (updates.checkInTime !== undefined) record.checkInTime = updates.checkInTime ? new Date(updates.checkInTime) : null;
  if (updates.checkOutTime !== undefined) record.checkOutTime = updates.checkOutTime ? new Date(updates.checkOutTime) : null;
  if (updates.source) record.source = updates.source;

  record.updatedBy = user.id;
  await record.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ATTENDANCE_UPDATED,
    userId: user.id,
    schoolId: record.schoolId,
    entityType: 'Attendance',
    entityId: record._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return record.toJSON();
}

export async function correctAttendance(id, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid attendance ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const record = await Attendance.findOne(query);
  if (!record) {
    throw AppError.notFound('Attendance record not found');
  }

  await verifyTeacherAssignment(user, {
    schoolId: record.schoolId,
    classId: record.classId,
    sectionId: record.sectionId,
  });

  const previousStatus = record.status;
  record.status = data.status;
  record.correctionReason = data.correctionReason.trim();
  record.correctedBy = user.id;
  record.correctedAt = new Date();
  if (data.remarks !== undefined) record.remarks = data.remarks;
  if (data.checkInTime !== undefined) record.checkInTime = data.checkInTime ? new Date(data.checkInTime) : null;
  if (data.checkOutTime !== undefined) record.checkOutTime = data.checkOutTime ? new Date(data.checkOutTime) : null;

  record.updatedBy = user.id;
  await record.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ATTENDANCE_CORRECTED,
    userId: user.id,
    schoolId: record.schoolId,
    entityType: 'Attendance',
    entityId: record._id,
    details: {
      previousStatus,
      newStatus: data.status,
      reason: data.correctionReason,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return record.toJSON();
}

export async function deleteAttendance(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid attendance ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const record = await Attendance.findOne(query);
  if (!record) {
    throw AppError.notFound('Attendance record not found');
  }

  await verifyTeacherAssignment(user, {
    schoolId: record.schoolId,
    classId: record.classId,
    sectionId: record.sectionId,
  });

  record.isDeleted = true;
  record.deletedAt = new Date();
  record.deletedBy = user.id;
  await record.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ATTENDANCE_DELETED,
    userId: user.id,
    schoolId: record.schoolId,
    entityType: 'Attendance',
    entityId: record._id,
    details: { studentId: record.studentId, date: record.date },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Attendance record deleted successfully' };
}

export async function getStudentAttendanceProfile(studentId, params, user) {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw AppError.badRequest('Invalid student ID format');
  }

  const schoolId = resolveSchoolId(user, params.schoolId);
  const student = await Student.findOne({ _id: studentId, ...(schoolId && { schoolId }) });
  if (!student) {
    throw AppError.notFound('Student not found');
  }

  await verifyStudentAccess(user, student._id, student.schoolId);

  const query = {
    schoolId: student.schoolId,
    studentId: student._id,
  };

  if (params.academicSessionId) query.academicSessionId = params.academicSessionId;
  if (params.startDate || params.endDate) {
    query.date = {};
    if (params.startDate) query.date.$gte = normalizeDate(params.startDate);
    if (params.endDate) query.date.$lte = normalizeDate(params.endDate);
  }

  const records = await Attendance.find(query)
    .populate('classId', 'name code')
    .populate('sectionId', 'name code')
    .sort({ date: -1 });

  const summary = calculateAttendanceSummary(records);

  return {
    student: student.toJSON(),
    summary,
    records: records.map((r) => r.toJSON()),
  };
}

export function calculateAttendanceSummary(records) {
  let present = 0;
  let absent = 0;
  let late = 0;
  let halfDay = 0;
  let excused = 0;
  let leave = 0;

  for (const r of records) {
    switch (r.status) {
      case ATTENDANCE_STATUS.PRESENT:
        present++;
        break;
      case ATTENDANCE_STATUS.ABSENT:
        absent++;
        break;
      case ATTENDANCE_STATUS.LATE:
        late++;
        break;
      case ATTENDANCE_STATUS.HALF_DAY:
        halfDay++;
        break;
      case ATTENDANCE_STATUS.EXCUSED:
        excused++;
        break;
      case ATTENDANCE_STATUS.LEAVE:
        leave++;
        break;
      default:
        break;
    }
  }

  const totalDays = records.length;
  // Weighted percentage formula:
  // PRESENT: 1.0, LATE: 1.0, HALF_DAY: 0.5, EXCUSED: 1.0, LEAVE / ABSENT: 0.0
  const effectivePresent = present + late + excused + (halfDay * 0.5);
  const percentage = totalDays > 0 ? Number(((effectivePresent / totalDays) * 100).toFixed(2)) : 0;

  return {
    totalDays,
    present,
    absent,
    late,
    halfDay,
    excused,
    leave,
    effectivePresent,
    percentage,
  };
}

export async function getAttendanceReportSummary(params, user) {
  const schoolId = resolveSchoolId(user, params.schoolId);
  const query = {};

  if (schoolId) query.schoolId = schoolId;
  if (params.academicSessionId) query.academicSessionId = params.academicSessionId;
  if (params.classId) query.classId = params.classId;
  if (params.sectionId) query.sectionId = params.sectionId;
  if (params.studentId) query.studentId = params.studentId;

  if (params.date) {
    query.date = normalizeDate(params.date);
  } else if (params.startDate || params.endDate) {
    query.date = {};
    if (params.startDate) query.date.$gte = normalizeDate(params.startDate);
    if (params.endDate) query.date.$lte = normalizeDate(params.endDate);
  }

  const records = await Attendance.find(query);
  const summary = calculateAttendanceSummary(records);

  return {
    filters: params,
    summary,
  };
}
