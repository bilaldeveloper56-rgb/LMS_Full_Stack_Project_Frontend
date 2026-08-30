import mongoose from 'mongoose';
import TeacherAssignment from './teacherAssignment.model.js';
import AcademicSession from './academicSession.model.js';
import Class from './class.model.js';
import Section from './section.model.js';
import Subject from './subject.model.js';
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

export async function createTeacherAssignment(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  // 1. Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // 2. Verify academic session
  const session = await AcademicSession.findOne({ _id: data.academicSessionId, schoolId });
  if (!session) {
    throw AppError.notFound('Academic session not found in this school');
  }

  // 3. Verify teacher
  const teacher = await Teacher.findOne({ _id: data.teacherId, schoolId });
  if (!teacher) {
    throw AppError.notFound('Teacher not found in this school');
  }

  // 4. Verify class
  const cls = await Class.findOne({ _id: data.classId, schoolId });
  if (!cls) {
    throw AppError.notFound('Class not found in this school');
  }

  // 5. Verify subject
  const subject = await Subject.findOne({ _id: data.subjectId, schoolId });
  if (!subject) {
    throw AppError.notFound('Subject not found in this school');
  }

  // Support one or multiple section IDs
  const targetSectionIds = Array.isArray(data.sectionIds) && data.sectionIds.length > 0
    ? [...new Set(data.sectionIds)]
    : data.sectionId
    ? [data.sectionId]
    : [];

  if (targetSectionIds.length === 0) {
    throw AppError.badRequest('At least one section ID is required');
  }

  const createdAssignments = [];

  for (const secId of targetSectionIds) {
    // Verify section belongs to class and school
    const section = await Section.findOne({ _id: secId, classId: data.classId, schoolId });
    if (!section) {
      throw AppError.notFound(`Section not found or does not belong to the selected class`);
    }

    // Check duplicate assignment
    const existing = await TeacherAssignment.findOne({
      schoolId,
      academicSessionId: data.academicSessionId,
      teacherId: data.teacherId,
      classId: data.classId,
      sectionId: secId,
      subjectId: data.subjectId,
    });

    if (existing) {
      if (targetSectionIds.length === 1) {
        throw AppError.conflict('Teacher is already assigned to this subject, class, and section');
      }
      continue;
    }

    const assignment = new TeacherAssignment({
      ...data,
      sectionId: secId,
      schoolId,
      createdBy: user.id,
    });

    await assignment.save();

    await logAuditEvent({
      event: AUTH_EVENTS.TEACHER_ASSIGNMENT_CREATED,
      userId: user.id,
      schoolId,
      entityType: 'TeacherAssignment',
      entityId: assignment._id,
      details: {
        teacherId: assignment.teacherId,
        classId: assignment.classId,
        sectionId: assignment.sectionId,
        subjectId: assignment.subjectId,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    createdAssignments.push(assignment);
  }

  if (createdAssignments.length === 0) {
    throw AppError.conflict('Teacher is already assigned to all selected sections for this subject and class');
  }

  return createdAssignments.length === 1
    ? createdAssignments[0].toJSON()
    : {
        ...createdAssignments[0].toJSON(),
        assignedSectionsCount: createdAssignments.length,
        assignments: createdAssignments.map((a) => a.toJSON()),
      };
}

export async function getTeacherAssignments(params, user) {
  const {
    page = 1,
    limit = 10,
    teacherId,
    classId,
    sectionId,
    subjectId,
    academicSessionId,
    schoolId: querySchoolId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  if (teacherId) query.teacherId = teacherId;
  if (classId) query.classId = classId;
  if (sectionId) query.sectionId = sectionId;
  if (subjectId) query.subjectId = subjectId;
  if (academicSessionId) query.academicSessionId = academicSessionId;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [assignments, total] = await Promise.all([
    TeacherAssignment.find(query)
      .populate('teacherId', 'firstName lastName employeeId email')
      .populate('classId', 'name code')
      .populate('sectionId', 'name code')
      .populate('subjectId', 'name code subjectType')
      .populate('academicSessionId', 'name status')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    TeacherAssignment.countDocuments(query),
  ]);

  return {
    assignments: assignments.map((a) => a.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getTeacherAssignmentById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid assignment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const assignment = await TeacherAssignment.findOne(query)
    .populate('teacherId', 'firstName lastName employeeId email')
    .populate('classId', 'name code')
    .populate('sectionId', 'name code')
    .populate('subjectId', 'name code subjectType')
    .populate('academicSessionId', 'name status');

  if (!assignment) {
    throw AppError.notFound('Teacher assignment not found');
  }

  return assignment.toJSON();
}

export async function updateTeacherAssignment(id, updates, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid assignment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const assignment = await TeacherAssignment.findOne(query);
  if (!assignment) {
    throw AppError.notFound('Teacher assignment not found');
  }

  if (updates.teacherId) {
    const teacher = await Teacher.findOne({ _id: updates.teacherId, schoolId: assignment.schoolId });
    if (!teacher) {
      throw AppError.notFound('Teacher not found in this school');
    }
    assignment.teacherId = updates.teacherId;
  }

  if (updates.subjectId) {
    const subject = await Subject.findOne({ _id: updates.subjectId, schoolId: assignment.schoolId });
    if (!subject) {
      throw AppError.notFound('Subject not found in this school');
    }
    assignment.subjectId = updates.subjectId;
  }

  assignment.updatedBy = user.id;
  await assignment.save();

  await logAuditEvent({
    event: AUTH_EVENTS.TEACHER_ASSIGNMENT_UPDATED,
    userId: user.id,
    schoolId: assignment.schoolId,
    entityType: 'TeacherAssignment',
    entityId: assignment._id,
    details: { updatedFields: Object.keys(updates) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return assignment.toJSON();
}

export async function deleteTeacherAssignment(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid assignment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  }

  const assignment = await TeacherAssignment.findOne(query);
  if (!assignment) {
    throw AppError.notFound('Teacher assignment not found');
  }

  await TeacherAssignment.findByIdAndDelete(assignment._id);

  await logAuditEvent({
    event: AUTH_EVENTS.TEACHER_ASSIGNMENT_DELETED,
    userId: user.id,
    schoolId: assignment.schoolId,
    entityType: 'TeacherAssignment',
    entityId: assignment._id,
    details: {
      teacherId: assignment.teacherId,
      classId: assignment.classId,
      sectionId: assignment.sectionId,
      subjectId: assignment.subjectId,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Teacher assignment deleted successfully' };
}
