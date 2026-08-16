import mongoose from 'mongoose';
import Assignment from './assignment.model.js';
import AssignmentSubmission from './assignmentSubmission.model.js';
import AcademicSession from '../academics/academicSession.model.js';
import Class from '../academics/class.model.js';
import Section from '../academics/section.model.js';
import Subject from '../academics/subject.model.js';
import Teacher from '../teachers/teacher.model.js';
import TeacherAssignment from '../academics/teacherAssignment.model.js';
import Student from '../students/student.model.js';
import Parent from '../parents/parent.model.js';
import StudentParent from '../parents/studentParent.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { logAuditEvent } from '../audit/audit.service.js';
import {
  AUTH_EVENTS,
  ROLES,
  ASSIGNMENT_STATUS,
  SUBMISSION_STATUS,
} from '../../constants/index.js';

export async function verifyTeacherSubjectAssignment(user, { schoolId, classId, sectionId, subjectId }) {
  if (user.role !== ROLES.TEACHER) return;

  const teacher = await Teacher.findOne({ userId: user.id, schoolId });
  if (!teacher) {
    throw AppError.forbidden('Teacher profile not found');
  }

  // Check subject-level assignment
  const assignment = await TeacherAssignment.findOne({
    schoolId,
    teacherId: teacher._id,
    classId,
    sectionId,
    subjectId,
    status: 'ACTIVE',
  });

  if (!assignment) {
    throw AppError.forbidden('Teachers can only manage assignments for their assigned classes and subjects');
  }

  return teacher._id;
}

export async function createAssignment(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) {
    throw AppError.badRequest('School ID is required');
  }

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found or inactive');
  }

  const [session, cls, section, subject] = await Promise.all([
    AcademicSession.findOne({ _id: data.academicSessionId, schoolId }),
    Class.findOne({ _id: data.classId, schoolId }),
    Section.findOne({ _id: data.sectionId, classId: data.classId, schoolId }),
    Subject.findOne({ _id: data.subjectId, schoolId }),
  ]);

  if (!session) throw AppError.notFound('Academic session not found');
  if (!cls) throw AppError.notFound('Class not found');
  if (!section) throw AppError.notFound('Section not found in class');
  if (!subject) throw AppError.notFound('Subject not found');

  let teacherId = data.teacherId;
  if (user.role === ROLES.TEACHER) {
    const verifiedTeacherId = await verifyTeacherSubjectAssignment(user, {
      schoolId,
      classId: data.classId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
    });
    teacherId = verifiedTeacherId;
  } else {
    if (!teacherId) {
      throw AppError.badRequest('Teacher ID is required when creating assignment');
    }
    const teacher = await Teacher.findOne({ _id: teacherId, schoolId });
    if (!teacher) throw AppError.notFound('Teacher not found in this school');
  }

  const assignment = new Assignment({
    ...data,
    schoolId,
    teacherId,
    status: ASSIGNMENT_STATUS.DRAFT,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await assignment.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ASSIGNMENT_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Assignment',
    entityId: assignment._id,
    details: { title: assignment.title, classId: data.classId, sectionId: data.sectionId, subjectId: data.subjectId },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return assignment.toJSON();
}

export async function publishAssignment(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid assignment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const assignment = await Assignment.findOne(query);
  if (!assignment) throw AppError.notFound('Assignment not found');

  if (user.role === ROLES.TEACHER) {
    await verifyTeacherSubjectAssignment(user, {
      schoolId: assignment.schoolId,
      classId: assignment.classId,
      sectionId: assignment.sectionId,
      subjectId: assignment.subjectId,
    });
  }

  assignment.status = ASSIGNMENT_STATUS.PUBLISHED;
  assignment.publishedAt = new Date();
  assignment.updatedBy = user.id;
  await assignment.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ASSIGNMENT_PUBLISHED,
    userId: user.id,
    schoolId: assignment.schoolId,
    entityType: 'Assignment',
    entityId: assignment._id,
    details: { publishedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return assignment.toJSON();
}

export async function getAssignmentsList(filters, user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  } else if (filters.schoolId) {
    query.schoolId = filters.schoolId;
  }

  // Role Scoping
  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!student) throw AppError.forbidden('Student profile not found');
    query.classId = student.classId;
    query.sectionId = student.sectionId;
    query.status = ASSIGNMENT_STATUS.PUBLISHED;
  } else if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!parent) throw AppError.forbidden('Parent profile not found');
    const links = await StudentParent.find({ parentId: parent._id, schoolId: user.schoolId });
    const students = await Student.find({ _id: { $in: links.map((l) => l.studentId) }, schoolId: user.schoolId });
    query.sectionId = { $in: students.map((s) => s.sectionId) };
    query.status = ASSIGNMENT_STATUS.PUBLISHED;
  } else if (user.role === ROLES.TEACHER) {
    const teacher = await Teacher.findOne({ userId: user.id, schoolId: user.schoolId });
    if (teacher) query.teacherId = teacher._id;
  }

  if (filters.academicSessionId) query.academicSessionId = filters.academicSessionId;
  if (filters.classId && user.role !== ROLES.STUDENT) query.classId = filters.classId;
  if (filters.sectionId && user.role !== ROLES.STUDENT) query.sectionId = filters.sectionId;
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.status && user.role !== ROLES.STUDENT && user.role !== ROLES.PARENT) {
    query.status = filters.status;
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [assignments, total] = await Promise.all([
    Assignment.find(query)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName')
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(limit),
    Assignment.countDocuments(query),
  ]);

  return {
    assignments: assignments.map((a) => a.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAssignmentById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid assignment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const assignment = await Assignment.findOne(query)
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name code')
    .populate('teacherId', 'firstName lastName');

  if (!assignment) throw AppError.notFound('Assignment not found');

  if (user.role === ROLES.STUDENT && assignment.status !== ASSIGNMENT_STATUS.PUBLISHED) {
    throw AppError.notFound('Assignment not found');
  }

  return assignment.toJSON();
}

export async function updateAssignment(id, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid assignment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const assignment = await Assignment.findOne(query);
  if (!assignment) throw AppError.notFound('Assignment not found');

  if (user.role === ROLES.TEACHER) {
    await verifyTeacherSubjectAssignment(user, {
      schoolId: assignment.schoolId,
      classId: assignment.classId,
      sectionId: assignment.sectionId,
      subjectId: assignment.subjectId,
    });
  }

  Object.assign(assignment, data);
  assignment.updatedBy = user.id;
  await assignment.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ASSIGNMENT_UPDATED,
    userId: user.id,
    schoolId: assignment.schoolId,
    entityType: 'Assignment',
    entityId: assignment._id,
    details: { changes: Object.keys(data) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return assignment.toJSON();
}

export async function deleteAssignment(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.badRequest('Invalid assignment ID format');
  }

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const assignment = await Assignment.findOne(query);
  if (!assignment) throw AppError.notFound('Assignment not found');

  if (user.role === ROLES.TEACHER) {
    await verifyTeacherSubjectAssignment(user, {
      schoolId: assignment.schoolId,
      classId: assignment.classId,
      sectionId: assignment.sectionId,
      subjectId: assignment.subjectId,
    });
  }

  assignment.isDeleted = true;
  assignment.deletedAt = new Date();
  assignment.deletedBy = user.id;
  await assignment.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ASSIGNMENT_DELETED,
    userId: user.id,
    schoolId: assignment.schoolId,
    entityType: 'Assignment',
    entityId: assignment._id,
    details: { deletedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Assignment deleted successfully' };
}

// Submissions
export async function submitAssignment(assignmentId, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw AppError.badRequest('Invalid assignment ID format');
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, schoolId: user.schoolId });
  if (!assignment) throw AppError.notFound('Assignment not found');

  if (assignment.status !== ASSIGNMENT_STATUS.PUBLISHED) {
    throw AppError.badRequest('Cannot submit to an unpublished assignment');
  }

  const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
  if (!student) {
    throw AppError.forbidden('Only enrolled students can submit assignments');
  }

  if (student.sectionId.toString() !== assignment.sectionId.toString()) {
    throw AppError.forbidden('You are not enrolled in the section for this assignment');
  }

  const now = new Date();
  const isLate = now > new Date(assignment.dueDate);
  if (isLate && !assignment.allowLateSubmission) {
    throw AppError.badRequest('Late submissions are not accepted for this assignment');
  }

  let submission = await AssignmentSubmission.findOne({
    schoolId: user.schoolId,
    assignmentId: assignment._id,
    studentId: student._id,
  });

  const submissionStatus = isLate ? SUBMISSION_STATUS.LATE : SUBMISSION_STATUS.SUBMITTED;

  if (submission) {
    submission.submissionContent = data.submissionContent || submission.submissionContent;
    submission.attachments = data.attachments || submission.attachments;
    submission.submittedAt = now;
    submission.status = submission.status === SUBMISSION_STATUS.GRADED ? SUBMISSION_STATUS.RESUBMITTED : submissionStatus;
    await submission.save();
  } else {
    submission = new AssignmentSubmission({
      schoolId: user.schoolId,
      assignmentId: assignment._id,
      studentId: student._id,
      submissionContent: data.submissionContent,
      attachments: data.attachments || [],
      submittedAt: now,
      status: submissionStatus,
    });
    await submission.save();
  }

  await logAuditEvent({
    event: AUTH_EVENTS.ASSIGNMENT_SUBMITTED,
    userId: user.id,
    schoolId: user.schoolId,
    entityType: 'AssignmentSubmission',
    entityId: submission._id,
    details: { assignmentId: assignment._id, studentId: student._id, isLate },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return submission.toJSON();
}

export async function getAssignmentSubmissions(assignmentId, user) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    throw AppError.badRequest('Invalid assignment ID format');
  }

  const query = { _id: assignmentId };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const assignment = await Assignment.findOne(query);
  if (!assignment) throw AppError.notFound('Assignment not found');

  if (user.role === ROLES.TEACHER) {
    await verifyTeacherSubjectAssignment(user, {
      schoolId: assignment.schoolId,
      classId: assignment.classId,
      sectionId: assignment.sectionId,
      subjectId: assignment.subjectId,
    });
  }

  const submissions = await AssignmentSubmission.find({
    schoolId: assignment.schoolId,
    assignmentId: assignment._id,
  }).populate('studentId', 'firstName lastName admissionNumber');

  return submissions.map((s) => s.toJSON());
}

export async function gradeSubmission(submissionId, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    throw AppError.badRequest('Invalid submission ID format');
  }

  const query = { _id: submissionId };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const submission = await AssignmentSubmission.findOne(query);
  if (!submission) throw AppError.notFound('Assignment submission not found');

  const assignment = await Assignment.findOne({ _id: submission.assignmentId, schoolId: submission.schoolId });
  if (!assignment) throw AppError.notFound('Parent assignment not found');

  if (user.role === ROLES.TEACHER) {
    await verifyTeacherSubjectAssignment(user, {
      schoolId: assignment.schoolId,
      classId: assignment.classId,
      sectionId: assignment.sectionId,
      subjectId: assignment.subjectId,
    });
  }

  if (data.score > assignment.maxScore) {
    throw AppError.badRequest(`Score cannot exceed assignment max score of ${assignment.maxScore}`);
  }

  let finalScore = data.score;
  if (submission.status === SUBMISSION_STATUS.LATE && assignment.lateSubmissionPenaltyPercentage > 0) {
    const penalty = assignment.lateSubmissionPenaltyPercentage;
    finalScore = Math.max(0, Number((data.score * (1 - penalty / 100)).toFixed(2)));
  }

  submission.score = finalScore;
  submission.feedback = data.feedback || null;
  submission.gradedBy = user.id;
  submission.gradedAt = new Date();
  submission.status = SUBMISSION_STATUS.GRADED;
  await submission.save();

  await logAuditEvent({
    event: AUTH_EVENTS.ASSIGNMENT_GRADED,
    userId: user.id,
    schoolId: submission.schoolId,
    entityType: 'AssignmentSubmission',
    entityId: submission._id,
    details: { score: finalScore, gradedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return submission.toJSON();
}
