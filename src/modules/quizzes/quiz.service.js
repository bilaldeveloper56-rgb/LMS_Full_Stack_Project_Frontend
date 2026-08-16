import mongoose from 'mongoose';
import Quiz from './quiz.model.js';
import QuizAttempt from './quizAttempt.model.js';
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
  QUIZ_STATUS,
  QUIZ_ATTEMPT_STATUS,
  QUESTION_TYPE,
} from '../../constants/index.js';

export async function verifyTeacherSubjectAssignment(user, { schoolId, classId, sectionId, subjectId }) {
  if (user.role !== ROLES.TEACHER) return;

  const teacher = await Teacher.findOne({ userId: user.id, schoolId });
  if (!teacher) {
    throw AppError.forbidden('Teacher profile not found');
  }

  const assignment = await TeacherAssignment.findOne({
    schoolId,
    teacherId: teacher._id,
    classId,
    sectionId,
    subjectId,
    status: 'ACTIVE',
  });

  if (!assignment) {
    throw AppError.forbidden('Teachers can only manage quizzes for their assigned classes and subjects');
  }

  return teacher._id;
}

export async function createQuiz(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) throw AppError.notFound('School not found or inactive');

  const [session, cls, section, subject] = await Promise.all([
    AcademicSession.findOne({ _id: data.academicSessionId, schoolId }),
    Class.findOne({ _id: data.classId, schoolId }),
    Section.findOne({ _id: data.sectionId, classId: data.classId, schoolId }),
    Subject.findOne({ _id: data.subjectId, schoolId }),
  ]);

  if (!session) throw AppError.notFound('Academic session not found');
  if (!cls) throw AppError.notFound('Class not found');
  if (!section) throw AppError.notFound('Section not found');
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
    if (!teacherId) throw AppError.badRequest('Teacher ID is required');
    const teacher = await Teacher.findOne({ _id: teacherId, schoolId });
    if (!teacher) throw AppError.notFound('Teacher not found in this school');
  }

  const quiz = new Quiz({
    ...data,
    schoolId,
    teacherId,
    status: QUIZ_STATUS.DRAFT,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await quiz.save();

  await logAuditEvent({
    event: AUTH_EVENTS.QUIZ_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'Quiz',
    entityId: quiz._id,
    details: { title: quiz.title, totalMarks: quiz.totalMarks, questionsCount: quiz.questions.length },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return quiz.toJSON();
}

export async function publishQuiz(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid quiz ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const quiz = await Quiz.findOne(query);
  if (!quiz) throw AppError.notFound('Quiz not found');

  if (user.role === ROLES.TEACHER) {
    await verifyTeacherSubjectAssignment(user, {
      schoolId: quiz.schoolId,
      classId: quiz.classId,
      sectionId: quiz.sectionId,
      subjectId: quiz.subjectId,
    });
  }

  quiz.status = QUIZ_STATUS.PUBLISHED;
  quiz.publishedAt = new Date();
  quiz.updatedBy = user.id;
  await quiz.save();

  await logAuditEvent({
    event: AUTH_EVENTS.QUIZ_PUBLISHED,
    userId: user.id,
    schoolId: quiz.schoolId,
    entityType: 'Quiz',
    entityId: quiz._id,
    details: { publishedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return quiz.toJSON();
}

export function maskQuizQuestionsForStudent(quizDoc) {
  const quizObj = quizDoc.toJSON();
  quizObj.questions = quizObj.questions.map((q) => ({
    id: q._id || q.id,
    questionText: q.questionText,
    questionType: q.questionType,
    marks: q.marks,
    options: (q.options || []).map((o, idx) => ({
      index: idx,
      optionText: o.optionText,
    })),
  }));
  return quizObj;
}

export async function getQuizById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid quiz ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const quiz = await Quiz.findOne(query)
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('subjectId', 'name code')
    .populate('teacherId', 'firstName lastName');

  if (!quiz) throw AppError.notFound('Quiz not found');

  if (user.role === ROLES.STUDENT) {
    if (quiz.status !== QUIZ_STATUS.PUBLISHED) throw AppError.notFound('Quiz not found');
    return maskQuizQuestionsForStudent(quiz);
  }

  return quiz.toJSON();
}

export async function getQuizzesList(filters, user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  } else if (filters.schoolId) {
    query.schoolId = filters.schoolId;
  }

  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!student) throw AppError.forbidden('Student profile not found');
    query.classId = student.classId;
    query.sectionId = student.sectionId;
    query.status = QUIZ_STATUS.PUBLISHED;
  } else if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!parent) throw AppError.forbidden('Parent profile not found');
    const links = await StudentParent.find({ parentId: parent._id, schoolId: user.schoolId });
    const students = await Student.find({ _id: { $in: links.map((l) => l.studentId) }, schoolId: user.schoolId });
    query.sectionId = { $in: students.map((s) => s.sectionId) };
    query.status = QUIZ_STATUS.PUBLISHED;
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

  const [quizzes, total] = await Promise.all([
    Quiz.find(query)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Quiz.countDocuments(query),
  ]);

  return {
    quizzes: quizzes.map((q) => (user.role === ROLES.STUDENT ? maskQuizQuestionsForStudent(q) : q.toJSON())),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateQuiz(id, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid quiz ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const quiz = await Quiz.findOne(query);
  if (!quiz) throw AppError.notFound('Quiz not found');

  if (user.role === ROLES.TEACHER) {
    await verifyTeacherSubjectAssignment(user, {
      schoolId: quiz.schoolId,
      classId: quiz.classId,
      sectionId: quiz.sectionId,
      subjectId: quiz.subjectId,
    });
  }

  Object.assign(quiz, data);
  quiz.updatedBy = user.id;
  await quiz.save();

  await logAuditEvent({
    event: AUTH_EVENTS.QUIZ_UPDATED,
    userId: user.id,
    schoolId: quiz.schoolId,
    entityType: 'Quiz',
    entityId: quiz._id,
    details: { changes: Object.keys(data) },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return quiz.toJSON();
}

export async function deleteQuiz(id, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid quiz ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const quiz = await Quiz.findOne(query);
  if (!quiz) throw AppError.notFound('Quiz not found');

  if (user.role === ROLES.TEACHER) {
    await verifyTeacherSubjectAssignment(user, {
      schoolId: quiz.schoolId,
      classId: quiz.classId,
      sectionId: quiz.sectionId,
      subjectId: quiz.subjectId,
    });
  }

  quiz.isDeleted = true;
  quiz.deletedAt = new Date();
  quiz.deletedBy = user.id;
  await quiz.save();

  await logAuditEvent({
    event: AUTH_EVENTS.QUIZ_DELETED,
    userId: user.id,
    schoolId: quiz.schoolId,
    entityType: 'Quiz',
    entityId: quiz._id,
    details: { deletedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { success: true, message: 'Quiz deleted successfully' };
}

// Attempts & Auto-Grading Engine
export async function startQuizAttempt(quizId, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(quizId)) throw AppError.badRequest('Invalid quiz ID format');

  const quiz = await Quiz.findOne({ _id: quizId, schoolId: user.schoolId });
  if (!quiz) throw AppError.notFound('Quiz not found');

  if (quiz.status !== QUIZ_STATUS.PUBLISHED) {
    throw AppError.badRequest('Cannot start an attempt on an unpublished quiz');
  }

  const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
  if (!student) throw AppError.forbidden('Only enrolled students can take quizzes');

  if (student.sectionId.toString() !== quiz.sectionId.toString()) {
    throw AppError.forbidden('You are not enrolled in the section for this quiz');
  }

  const existingAttemptsCount = await QuizAttempt.countDocuments({
    schoolId: user.schoolId,
    quizId: quiz._id,
    studentId: student._id,
  });

  if (existingAttemptsCount >= quiz.maxAttempts) {
    throw AppError.badRequest(`Maximum attempt limit (${quiz.maxAttempts}) reached for this quiz`);
  }

  const attempt = new QuizAttempt({
    schoolId: user.schoolId,
    quizId: quiz._id,
    studentId: student._id,
    attemptNumber: existingAttemptsCount + 1,
    startedAt: new Date(),
    status: QUIZ_ATTEMPT_STATUS.IN_PROGRESS,
  });

  await attempt.save();

  await logAuditEvent({
    event: AUTH_EVENTS.QUIZ_ATTEMPT_STARTED,
    userId: user.id,
    schoolId: user.schoolId,
    entityType: 'QuizAttempt',
    entityId: attempt._id,
    details: { quizId: quiz._id, attemptNumber: attempt.attemptNumber },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return attempt.toJSON();
}

export async function submitQuizAttempt(attemptId, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) throw AppError.badRequest('Invalid attempt ID format');

  const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
  if (!student) throw AppError.forbidden('Student profile not found');

  const attempt = await QuizAttempt.findOne({
    _id: attemptId,
    schoolId: user.schoolId,
    studentId: student._id,
  });

  if (!attempt) throw AppError.notFound('Quiz attempt not found');

  if (attempt.status !== QUIZ_ATTEMPT_STATUS.IN_PROGRESS) {
    throw AppError.badRequest('This attempt has already been submitted');
  }

  const quiz = await Quiz.findOne({ _id: attempt.quizId, schoolId: user.schoolId });
  if (!quiz) throw AppError.notFound('Parent quiz not found');

  // Auto-evaluation engine
  let calculatedScore = 0;
  let hasShortAnswer = false;

  const processedAnswers = data.answers.map((ans) => {
    const question = quiz.questions.find((q) => q._id.toString() === ans.questionId.toString());
    if (!question) {
      return {
        questionId: ans.questionId,
        selectedOptionIndex: ans.selectedOptionIndex,
        textAnswer: ans.textAnswer,
        isCorrect: false,
        marksAwarded: 0,
      };
    }

    if (question.questionType === QUESTION_TYPE.MCQ || question.questionType === QUESTION_TYPE.TRUE_FALSE) {
      const selectedOpt = question.options[ans.selectedOptionIndex];
      const isCorrect = Boolean(selectedOpt && selectedOpt.isCorrect);
      const marksAwarded = isCorrect ? question.marks : 0;
      calculatedScore += marksAwarded;
      return {
        questionId: ans.questionId,
        selectedOptionIndex: ans.selectedOptionIndex,
        textAnswer: null,
        isCorrect,
        marksAwarded,
      };
    }

    if (question.questionType === QUESTION_TYPE.SHORT_ANSWER) {
      hasShortAnswer = true;
      return {
        questionId: ans.questionId,
        selectedOptionIndex: null,
        textAnswer: ans.textAnswer || '',
        isCorrect: null, // Pending teacher review
        marksAwarded: 0,
      };
    }

    return ans;
  });

  attempt.answers = processedAnswers;
  attempt.submittedAt = new Date();
  attempt.totalScore = calculatedScore;

  if (!hasShortAnswer) {
    attempt.status = QUIZ_ATTEMPT_STATUS.EVALUATED;
    attempt.isPassed = calculatedScore >= quiz.passingMarks;
  } else {
    attempt.status = QUIZ_ATTEMPT_STATUS.SUBMITTED;
  }

  await attempt.save();

  await logAuditEvent({
    event: AUTH_EVENTS.QUIZ_ATTEMPT_SUBMITTED,
    userId: user.id,
    schoolId: user.schoolId,
    entityType: 'QuizAttempt',
    entityId: attempt._id,
    details: { totalScore: calculatedScore, status: attempt.status },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return attempt.toJSON();
}

export async function gradeQuizAttempt(attemptId, data, user, meta = {}) {
  if (!mongoose.Types.ObjectId.isValid(attemptId)) throw AppError.badRequest('Invalid attempt ID format');

  const query = { _id: attemptId };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const attempt = await QuizAttempt.findOne(query);
  if (!attempt) throw AppError.notFound('Quiz attempt not found');

  const quiz = await Quiz.findOne({ _id: attempt.quizId, schoolId: attempt.schoolId });
  if (!quiz) throw AppError.notFound('Parent quiz not found');

  if (user.role === ROLES.TEACHER) {
    await verifyTeacherSubjectAssignment(user, {
      schoolId: quiz.schoolId,
      classId: quiz.classId,
      sectionId: quiz.sectionId,
      subjectId: quiz.subjectId,
    });
  }

  // Update question grades
  for (const gradeItem of data.answers) {
    const existingAns = attempt.answers.find((a) => a.questionId.toString() === gradeItem.questionId.toString());
    if (existingAns) {
      existingAns.marksAwarded = gradeItem.marksAwarded;
      if (gradeItem.isCorrect !== undefined) existingAns.isCorrect = gradeItem.isCorrect;
    }
  }

  const totalScore = attempt.answers.reduce((sum, ans) => sum + (ans.marksAwarded || 0), 0);

  attempt.totalScore = totalScore;
  attempt.isPassed = totalScore >= quiz.passingMarks;
  attempt.status = QUIZ_ATTEMPT_STATUS.EVALUATED;
  attempt.feedback = data.feedback || attempt.feedback;
  attempt.gradedBy = user.id;
  attempt.gradedAt = new Date();
  await attempt.save();

  await logAuditEvent({
    event: AUTH_EVENTS.QUIZ_ATTEMPT_GRADED,
    userId: user.id,
    schoolId: attempt.schoolId,
    entityType: 'QuizAttempt',
    entityId: attempt._id,
    details: { totalScore, gradedBy: user.id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return attempt.toJSON();
}
