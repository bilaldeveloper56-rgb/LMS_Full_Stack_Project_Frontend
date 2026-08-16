import mongoose from 'mongoose';
import Exam from './exam.model.js';
import ExamPaper from './examPaper.model.js';
import AcademicSession from '../academics/academicSession.model.js';
import Class from '../academics/class.model.js';
import Subject from '../academics/subject.model.js';
import Teacher from '../teachers/teacher.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { logAuditEvent } from '../audit/audit.service.js';
import { AUTH_EVENTS, ROLES } from '../../constants/index.js';

export async function createExam(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) throw AppError.notFound('School not found or inactive');

  const session = await AcademicSession.findOne({ _id: data.academicSessionId, schoolId });
  if (!session) throw AppError.notFound('Academic session not found in this school');

  const existingExam = await Exam.findOne({
    schoolId,
    academicSessionId: data.academicSessionId,
    name: data.name.trim(),
  });
  if (existingExam) {
    throw AppError.conflict(`An exam term named '${data.name}' already exists in this session`);
  }

  const exam = new Exam({
    ...data,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await exam.save();

  await logAuditEvent({
    event: AUTH_EVENTS.EXAM_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Exam',
    entityId: exam._id,
    details: { name: exam.name, examType: exam.examType, startDate: exam.startDate, endDate: exam.endDate },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return exam.toJSON();
}

export async function publishExam(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid exam ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const exam = await Exam.findOne(query);
  if (!exam) throw AppError.notFound('Exam not found');

  exam.isPublished = true;
  exam.publishedAt = new Date();
  exam.updatedBy = user.id;
  await exam.save();

  await logAuditEvent({
    event: AUTH_EVENTS.EXAM_PUBLISHED,
    userId: user.id,
    schoolId: exam.schoolId,
    entityType: 'Exam',
    entityId: exam._id,
    details: { publishedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return exam.toJSON();
}

export async function getExamsList(filters, user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  } else if (filters.schoolId) {
    query.schoolId = filters.schoolId;
  }

  if (user.role === ROLES.STUDENT || user.role === ROLES.PARENT) {
    query.isPublished = true;
  }

  if (filters.academicSessionId) query.academicSessionId = filters.academicSessionId;
  if (filters.examType) query.examType = filters.examType;
  if (filters.status) query.status = filters.status;

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [exams, total] = await Promise.all([
    Exam.find(query)
      .populate('academicSessionId', 'name')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit),
    Exam.countDocuments(query),
  ]);

  return {
    exams: exams.map((e) => e.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getExamById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid exam ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const exam = await Exam.findOne(query).populate('academicSessionId', 'name');
  if (!exam) throw AppError.notFound('Exam not found');

  if ((user.role === ROLES.STUDENT || user.role === ROLES.PARENT) && !exam.isPublished) {
    throw AppError.notFound('Exam not found');
  }

  const papers = await ExamPaper.find({ schoolId: exam.schoolId, examId: exam._id })
    .populate('classId', 'name')
    .populate('subjectId', 'name code')
    .populate('invigilatorTeacherId', 'firstName lastName')
    .sort({ date: 1, startTime: 1 });

  const examJson = exam.toJSON();
  examJson.papers = papers.map((p) => p.toJSON());
  return examJson;
}

export async function updateExam(id, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid exam ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const exam = await Exam.findOne(query);
  if (!exam) throw AppError.notFound('Exam not found');

  Object.assign(exam, data);
  exam.updatedBy = user.id;
  await exam.save();

  await logAuditEvent({
    event: AUTH_EVENTS.EXAM_UPDATED,
    userId: user.id,
    schoolId: exam.schoolId,
    entityType: 'Exam',
    entityId: exam._id,
    details: { changes: Object.keys(data) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return exam.toJSON();
}

export async function deleteExam(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid exam ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const exam = await Exam.findOne(query);
  if (!exam) throw AppError.notFound('Exam not found');

  exam.isDeleted = true;
  exam.deletedAt = new Date();
  exam.deletedBy = user.id;
  await exam.save();

  await logAuditEvent({
    event: AUTH_EVENTS.EXAM_DELETED,
    userId: user.id,
    schoolId: exam.schoolId,
    entityType: 'Exam',
    entityId: exam._id,
    details: { deletedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Exam deleted successfully' };
}

// Exam Papers Scheduling
export async function scheduleExamPaper(examId, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(examId)) throw AppError.badRequest('Invalid exam ID format');

  const query = { _id: examId };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const exam = await Exam.findOne(query);
  if (!exam) throw AppError.notFound('Parent exam not found');

  // Verify class and subject
  const [cls, subject] = await Promise.all([
    Class.findOne({ _id: data.classId, schoolId: exam.schoolId }),
    Subject.findOne({ _id: data.subjectId, schoolId: exam.schoolId }),
  ]);
  if (!cls) throw AppError.notFound('Class not found in this school');
  if (!subject) throw AppError.notFound('Subject not found in this school');

  if (data.invigilatorTeacherId) {
    const teacher = await Teacher.findOne({ _id: data.invigilatorTeacherId, schoolId: exam.schoolId });
    if (!teacher) throw AppError.notFound('Invigilator teacher not found in this school');
  }

  // Check duplicate paper for same class + subject in this exam
  const existingPaper = await ExamPaper.findOne({
    schoolId: exam.schoolId,
    examId: exam._id,
    classId: data.classId,
    subjectId: data.subjectId,
  });
  if (existingPaper) {
    throw AppError.conflict('An exam paper is already scheduled for this class and subject in this exam');
  }

  const paper = new ExamPaper({
    ...data,
    schoolId: exam.schoolId,
    examId: exam._id,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await paper.save();

  await logAuditEvent({
    event: AUTH_EVENTS.EXAM_PAPER_CREATED,
    userId: user.id,
    schoolId: exam.schoolId,
    entityType: 'ExamPaper',
    entityId: paper._id,
    details: { examId: exam._id, classId: data.classId, subjectId: data.subjectId, date: data.date },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return paper.toJSON();
}
