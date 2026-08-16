import mongoose from 'mongoose';
import Result from './result.model.js';
import GradingScale from './gradingScale.model.js';
import Exam from '../exams/exam.model.js';
import ExamPaper from '../exams/examPaper.model.js';
import Student from '../students/student.model.js';
import Parent from '../parents/parent.model.js';
import StudentParent from '../parents/studentParent.model.js';
import Teacher from '../teachers/teacher.model.js';
import TeacherAssignment from '../academics/teacherAssignment.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { logAuditEvent } from '../audit/audit.service.js';
import { AUTH_EVENTS, ROLES } from '../../constants/index.js';

export async function resolveGrade(percentage, schoolId) {
  let scale = await GradingScale.findOne({ schoolId, isDefault: true });
  if (!scale) {
    scale = await GradingScale.findOne({ schoolId });
  }

  const defaultGrades = [
    { grade: 'A+', minPercentage: 90, maxPercentage: 100, gradePoint: 4.0 },
    { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gradePoint: 3.7 },
    { grade: 'B', minPercentage: 70, maxPercentage: 79.99, gradePoint: 3.0 },
    { grade: 'C', minPercentage: 60, maxPercentage: 69.99, gradePoint: 2.0 },
    { grade: 'D', minPercentage: 50, maxPercentage: 59.99, gradePoint: 1.0 },
    { grade: 'F', minPercentage: 0, maxPercentage: 49.99, gradePoint: 0.0 },
  ];

  const grades = scale ? scale.grades : defaultGrades;

  for (const g of grades) {
    if (percentage >= g.minPercentage && percentage <= g.maxPercentage) {
      return { grade: g.grade, gradePoint: g.gradePoint };
    }
  }

  // Fallback for edge boundaries
  if (percentage >= 100) return { grade: 'A+', gradePoint: 4.0 };
  return { grade: 'F', gradePoint: 0.0 };
}

// Grading Scales
export async function createGradingScale(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) throw AppError.notFound('School not found or inactive');

  if (data.isDefault) {
    await GradingScale.updateMany({ schoolId }, { isDefault: false });
  }

  const scale = new GradingScale({
    ...data,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await scale.save();

  await logAuditEvent({
    event: AUTH_EVENTS.GRADING_SCALE_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'GradingScale',
    entityId: scale._id,
    details: { name: scale.name },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return scale.toJSON();
}

export async function getGradingScales(user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;
  const scales = await GradingScale.find(query).sort({ isDefault: -1, name: 1 });
  return scales.map((s) => s.toJSON());
}

// Marks Entry & Result Management
export async function recordStudentMarks(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const [exam, paper, student] = await Promise.all([
    Exam.findOne({ _id: data.examId, schoolId }),
    ExamPaper.findOne({ _id: data.examPaperId, examId: data.examId, schoolId }),
    Student.findOne({ _id: data.studentId, schoolId }),
  ]);

  if (!exam) throw AppError.notFound('Exam term not found');
  if (!paper) throw AppError.notFound('Exam paper not found');
  if (!student) throw AppError.notFound('Student not found');

  if (data.marksObtained > paper.totalMarks) {
    throw AppError.badRequest(`Marks obtained cannot exceed paper total marks (${paper.totalMarks})`);
  }

  let result = await Result.findOne({
    schoolId,
    examId: exam._id,
    examPaperId: paper._id,
    studentId: student._id,
  });

  if (result && result.isLocked) {
    throw AppError.badRequest('Results for this student and exam paper are locked and cannot be modified');
  }

  const percentage = Number(((data.marksObtained / paper.totalMarks) * 100).toFixed(2));
  const { grade, gradePoint } = await resolveGrade(percentage, schoolId);

  if (result) {
    result.marksObtained = data.marksObtained;
    result.maxMarks = paper.totalMarks;
    result.percentage = percentage;
    result.grade = grade;
    result.gradePoint = gradePoint;
    result.remarks = data.remarks || result.remarks;
    result.updatedBy = user.id;
    await result.save();
  } else {
    result = new Result({
      schoolId,
      academicSessionId: exam.academicSessionId,
      examId: exam._id,
      examPaperId: paper._id,
      studentId: student._id,
      classId: student.classId,
      sectionId: student.sectionId,
      subjectId: paper.subjectId,
      marksObtained: data.marksObtained,
      maxMarks: paper.totalMarks,
      percentage,
      grade,
      gradePoint,
      remarks: data.remarks || '',
      createdBy: user.id,
      updatedBy: user.id,
    });
    await result.save();
  }

  await logAuditEvent({
    event: AUTH_EVENTS.RESULT_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Result',
    entityId: result._id,
    details: { studentId: student._id, marksObtained: data.marksObtained, percentage, grade },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return result.toJSON();
}

export async function bulkRecordMarks(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const [exam, paper] = await Promise.all([
    Exam.findOne({ _id: data.examId, schoolId }),
    ExamPaper.findOne({ _id: data.examPaperId, examId: data.examId, schoolId }),
  ]);

  if (!exam) throw AppError.notFound('Exam term not found');
  if (!paper) throw AppError.notFound('Exam paper not found');

  const studentIds = data.records.map((r) => r.studentId);
  const students = await Student.find({ _id: { $in: studentIds }, schoolId });
  const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

  const results = [];
  for (const item of data.records) {
    const student = studentMap.get(item.studentId.toString());
    if (!student) throw AppError.notFound(`Student with ID ${item.studentId} not found in this school`);

    if (item.marksObtained > paper.totalMarks) {
      throw AppError.badRequest(`Marks for student ${student.admissionNumber} exceed max marks of ${paper.totalMarks}`);
    }

    let existing = await Result.findOne({
      schoolId,
      examId: exam._id,
      examPaperId: paper._id,
      studentId: student._id,
    });

    if (existing && existing.isLocked) {
      throw AppError.badRequest(`Result for student ${student.admissionNumber} is locked`);
    }

    const percentage = Number(((item.marksObtained / paper.totalMarks) * 100).toFixed(2));
    const { grade, gradePoint } = await resolveGrade(percentage, schoolId);

    if (existing) {
      existing.marksObtained = item.marksObtained;
      existing.maxMarks = paper.totalMarks;
      existing.percentage = percentage;
      existing.grade = grade;
      existing.gradePoint = gradePoint;
      existing.remarks = item.remarks || existing.remarks;
      existing.updatedBy = user.id;
      await existing.save();
      results.push(existing.toJSON());
    } else {
      const newResult = new Result({
        schoolId,
        academicSessionId: exam.academicSessionId,
        examId: exam._id,
        examPaperId: paper._id,
        studentId: student._id,
        classId: student.classId,
        sectionId: student.sectionId,
        subjectId: paper.subjectId,
        marksObtained: item.marksObtained,
        maxMarks: paper.totalMarks,
        percentage,
        grade,
        gradePoint,
        remarks: item.remarks || '',
        createdBy: user.id,
        updatedBy: user.id,
      });
      await newResult.save();
      results.push(newResult.toJSON());
    }
  }

  await logAuditEvent({
    event: AUTH_EVENTS.RESULT_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Result',
    details: { examPaperId: paper._id, count: results.length },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return results;
}

export async function lockSectionResults(examId, sectionId, user, meta = {}) {
  const query = { examId, sectionId };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const updateResult = await Result.updateMany(query, {
    isLocked: true,
    lockedBy: user.id,
    lockedAt: new Date(),
    updatedBy: user.id,
  });

  await logAuditEvent({
    event: AUTH_EVENTS.RESULT_LOCKED,
    userId: user.id,
    schoolId: user.schoolId,
    entityType: 'Result',
    details: { examId, sectionId, lockedCount: updateResult.modifiedCount },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: `Locked ${updateResult.modifiedCount} result records` };
}

export async function unlockSectionResults(examId, sectionId, user, meta = {}) {
  const query = { examId, sectionId };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const updateResult = await Result.updateMany(query, {
    isLocked: false,
    lockedBy: null,
    lockedAt: null,
    updatedBy: user.id,
  });

  await logAuditEvent({
    event: AUTH_EVENTS.RESULT_UNLOCKED,
    userId: user.id,
    schoolId: user.schoolId,
    entityType: 'Result',
    details: { examId, sectionId, unlockedCount: updateResult.modifiedCount },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: `Unlocked ${updateResult.modifiedCount} result records` };
}

export async function publishSectionResults(examId, sectionId, user, meta = {}) {
  const query = { examId, sectionId };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const updateResult = await Result.updateMany(query, {
    isPublished: true,
    publishedBy: user.id,
    publishedAt: new Date(),
    updatedBy: user.id,
  });

  await logAuditEvent({
    event: AUTH_EVENTS.RESULT_PUBLISHED,
    userId: user.id,
    schoolId: user.schoolId,
    entityType: 'Result',
    details: { examId, sectionId, publishedCount: updateResult.modifiedCount },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: `Published ${updateResult.modifiedCount} result records` };
}

export async function getStudentReportCard(studentId, examId, user) {
  if (!mongoose.Types.ObjectId.isValid(studentId)) throw AppError.badRequest('Invalid student ID format');

  const schoolId = user.role === ROLES.SUPER_ADMIN ? null : user.schoolId;
  const studentQuery = { _id: studentId };
  if (schoolId) studentQuery.schoolId = schoolId;

  const student = await Student.findOne(studentQuery)
    .populate('classId', 'name')
    .populate('sectionId', 'name');
  if (!student) throw AppError.notFound('Student not found');

  // Role Checks
  if (user.role === ROLES.STUDENT) {
    if (student.userId.toString() !== user.id) {
      throw AppError.forbidden('Students can only access their own report card');
    }
  }

  if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!parent) throw AppError.forbidden('Parent profile not found');
    const link = await StudentParent.findOne({ parentId: parent._id, studentId: student._id, schoolId: user.schoolId });
    if (!link) {
      throw AppError.forbidden('Parents can only view report cards of their linked children');
    }
  }

  const query = { studentId: student._id };
  if (schoolId) query.schoolId = schoolId;
  if (examId) query.examId = examId;

  if (user.role === ROLES.STUDENT || user.role === ROLES.PARENT) {
    query.isPublished = true;
  }

  const marks = await Result.find(query)
    .populate('examId', 'name examType')
    .populate('subjectId', 'name code')
    .sort({ createdAt: 1 });

  let totalMarksObtained = 0;
  let totalMaxMarks = 0;
  let totalGradePoints = 0;

  marks.forEach((m) => {
    totalMarksObtained += m.marksObtained;
    totalMaxMarks += m.maxMarks;
    totalGradePoints += m.gradePoint;
  });

  const count = marks.length;
  const overallPercentage = totalMaxMarks > 0 ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
  const gpa = count > 0 ? Number((totalGradePoints / count).toFixed(2)) : 0;
  const { grade: overallGrade } = await resolveGrade(overallPercentage, student.schoolId);

  return {
    student: student.toJSON(),
    summary: {
      totalSubjects: count,
      totalMarksObtained,
      totalMaxMarks,
      overallPercentage,
      gpa,
      overallGrade,
    },
    results: marks.map((m) => m.toJSON()),
  };
}

export async function getSectionResults(examId, sectionId, user) {
  if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(sectionId)) {
    throw AppError.badRequest('Invalid exam or section ID format');
  }

  const query = { examId, sectionId };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  if (user.role === ROLES.STUDENT || user.role === ROLES.PARENT) {
    query.isPublished = true;
  }

  const results = await Result.find(query)
    .populate('studentId', 'firstName lastName admissionNumber')
    .populate('subjectId', 'name code')
    .sort({ studentId: 1 });

  return results.map((r) => r.toJSON());
}
