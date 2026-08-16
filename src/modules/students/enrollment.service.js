import mongoose from 'mongoose';
import Enrollment from './enrollment.model.js';
import Student from './student.model.js';
import AcademicSession from '../academics/academicSession.model.js';
import Class from '../academics/class.model.js';
import Section from '../academics/section.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { ROLES, AUTH_EVENTS, ENROLLMENT_STATUS } from '../../constants/index.js';
import { logAuditEvent } from '../audit/audit.service.js';

function resolveSchoolId(user, explicitSchoolId) {
  if (user.role === ROLES.SUPER_ADMIN) {
    return explicitSchoolId || user.schoolId || null;
  }
  return user.schoolId;
}

export async function createEnrollment(data, user, meta = {}) {
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

  // 3. Verify academic session in this school
  const session = await AcademicSession.findOne({ _id: data.academicSessionId, schoolId });
  if (!session) {
    throw AppError.notFound('Academic session not found in this school');
  }

  // 4. Verify class
  const cls = await Class.findOne({ _id: data.classId, schoolId });
  if (!cls) {
    throw AppError.notFound('Class not found in this school');
  }

  // 5. Verify section and verify it belongs to class
  const section = await Section.findOne({ _id: data.sectionId, classId: data.classId, schoolId });
  if (!section) {
    throw AppError.notFound('Section not found or does not belong to the selected class');
  }

  // 6. Check existing active enrollment in same session
  const existingActive = await Enrollment.findOne({
    schoolId,
    studentId: data.studentId,
    academicSessionId: data.academicSessionId,
    enrollmentStatus: ENROLLMENT_STATUS.ACTIVE,
  });
  if (existingActive) {
    throw AppError.conflict('Student already has an active enrollment in this academic session');
  }

  const enrollment = new Enrollment({
    ...data,
    schoolId,
    createdBy: user.id,
  });

  await enrollment.save();

  // Update student's current class/section/session pointer
  student.academicSessionId = data.academicSessionId;
  student.classId = data.classId;
  student.sectionId = data.sectionId;
  if (data.rollNumber !== undefined) student.rollNumber = data.rollNumber;
  if (data.enrollmentStatus) student.enrollmentStatus = data.enrollmentStatus;
  await student.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ENROLLMENT_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Enrollment',
    entityId: enrollment._id,
    details: {
      studentId: enrollment.studentId,
      academicSessionId: enrollment.academicSessionId,
      classId: enrollment.classId,
      sectionId: enrollment.sectionId,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return enrollment.toJSON();
}

export async function getEnrollments(params, user) {
  const {
    page = 1,
    limit = 10,
    studentId,
    academicSessionId,
    classId,
    sectionId,
    enrollmentStatus,
    schoolId: querySchoolId,
    sortBy = 'enrolledAt',
    sortOrder = 'desc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  if (studentId) query.studentId = studentId;
  if (academicSessionId) query.academicSessionId = academicSessionId;
  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;
  if (enrollmentStatus) query.enrollmentStatus = enrollmentStatus;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [enrollments, total] = await Promise.all([
    Enrollment.find(query)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('academicSessionId', 'name status isCurrent')
      .populate('classId', 'name code')
      .populate('sectionId', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments(query),
  ]);

  return {
    enrollments: enrollments.map((e) => e.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getEnrollmentById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid enrollment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const enrollment = await Enrollment.findOne(query)
    .populate('studentId', 'firstName lastName admissionNumber')
    .populate('academicSessionId', 'name status isCurrent')
    .populate('classId', 'name code')
    .populate('sectionId', 'name code');

  if (!enrollment) {
    throw AppError.notFound('Enrollment record not found');
  }

  return enrollment.toJSON();
}

export async function updateEnrollment(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid enrollment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const enrollment = await Enrollment.findOne(query);
  if (!enrollment) {
    throw AppError.notFound('Enrollment record not found');
  }

  if (updates.classId || updates.sectionId) {
    const targetClassId = updates.classId || enrollment.classId;
    const targetSectionId = updates.sectionId || enrollment.sectionId;

    const section = await Section.findOne({
      _id: targetSectionId,
      classId: targetClassId,
      schoolId: enrollment.schoolId,
    });
    if (!section) {
      throw AppError.notFound('Section not found or does not belong to the class');
    }
    enrollment.classId = targetClassId;
    enrollment.sectionId = targetSectionId;
  }

  if (updates.rollNumber !== undefined) enrollment.rollNumber = updates.rollNumber;
  if (updates.enrollmentStatus) enrollment.enrollmentStatus = updates.enrollmentStatus;
  if (updates.leftAt !== undefined) enrollment.leftAt = updates.leftAt ? new Date(updates.leftAt) : null;

  enrollment.updatedBy = user.id;
  await enrollment.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ENROLLMENT_UPDATED,
    userId: user.id,
    schoolId: enrollment.schoolId,
    entityType: 'Enrollment',
    entityId: enrollment._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return enrollment.toJSON();
}

export async function deleteEnrollment(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid enrollment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const enrollment = await Enrollment.findOne(query);
  if (!enrollment) {
    throw AppError.notFound('Enrollment record not found');
  }

  await Enrollment.findByIdAndDelete(enrollment._id);

  await logAuditEvent({
    event: AUTH_EVENTS.ENROLLMENT_DELETED,
    userId: user.id,
    schoolId: enrollment.schoolId,
    entityType: 'Enrollment',
    entityId: enrollment._id,
    details: { studentId: enrollment.studentId, academicSessionId: enrollment.academicSessionId },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Enrollment record deleted successfully' };
}

export async function getStudentEnrollments(studentId, user) {
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

  const enrollments = await Enrollment.find({
    schoolId: student.schoolId,
    studentId: student._id,
  })
    .populate('academicSessionId', 'name status isCurrent')
    .populate('classId', 'name code')
    .populate('sectionId', 'name code')
    .sort({ enrolledAt: -1 });

  return enrollments.map((e) => e.toJSON());
}
