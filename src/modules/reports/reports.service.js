import mongoose from 'mongoose';
import Student from '../students/student.model.js';
import Enrollment from '../students/enrollment.model.js';
import Attendance from '../attendance/attendance.model.js';
import FeeInvoice from '../fees/feeInvoice.model.js';
import Result from '../results/result.model.js';
import AppError from '../../utils/AppError.js';

/**
 * Generate a detailed student roster report.
 *
 * @param {string|mongoose.Types.ObjectId} schoolId
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export async function getStudentRoster(schoolId, filters = {}) {
  const schoolObjectId = typeof schoolId === 'string' ? new mongoose.Types.ObjectId(schoolId) : schoolId;
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const matchCriteria = { schoolId: schoolObjectId, isDeleted: { $ne: true } };
  if (filters.enrollmentStatus) {
    matchCriteria.enrollmentStatus = filters.enrollmentStatus;
  }

  const [students, total] = await Promise.all([
    Student.find(matchCriteria)
      .populate({
        path: 'userId',
        select: 'firstName lastName email phone avatar status',
      })
      .sort({ admissionNumber: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(matchCriteria),
  ]);

  // Attach enrollment info if available
  const studentIds = students.map((s) => s._id);
  const enrollmentQuery = {
    schoolId: schoolObjectId,
    studentId: { $in: studentIds },
    isDeleted: { $ne: true },
  };
  if (filters.academicSessionId) {
    enrollmentQuery.academicSessionId = filters.academicSessionId;
  }
  if (filters.classId) {
    enrollmentQuery.classId = filters.classId;
  }
  if (filters.sectionId) {
    enrollmentQuery.sectionId = filters.sectionId;
  }

  const enrollments = await Enrollment.find(enrollmentQuery)
    .populate('classId', 'name code')
    .populate('sectionId', 'name code')
    .populate('academicSessionId', 'name')
    .lean();

  const enrollmentMap = new Map();
  for (const e of enrollments) {
    enrollmentMap.set(e.studentId.toString(), e);
  }

  const roster = students.map((s) => {
    const e = enrollmentMap.get(s._id.toString());
    return {
      studentId: s._id,
      admissionNumber: s.admissionNumber,
      firstName: s.userId?.firstName || '',
      lastName: s.userId?.lastName || '',
      email: s.userId?.email || '',
      phone: s.userId?.phone || '',
      gender: s.gender,
      bloodGroup: s.bloodGroup,
      enrollmentStatus: s.enrollmentStatus,
      class: e?.classId ? { id: e.classId._id, name: e.classId.name, code: e.classId.code } : null,
      section: e?.sectionId ? { id: e.sectionId._id, name: e.sectionId.name, code: e.sectionId.code } : null,
      rollNumber: e?.rollNumber || null,
      session: e?.academicSessionId?.name || null,
    };
  });

  return {
    roster,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Generate attendance register & summary report.
 *
 * @param {string|mongoose.Types.ObjectId} schoolId
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export async function getAttendanceReport(schoolId, filters = {}) {
  const schoolObjectId = typeof schoolId === 'string' ? new mongoose.Types.ObjectId(schoolId) : schoolId;
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const matchCriteria = { schoolId: schoolObjectId, isDeleted: { $ne: true } };

  if (filters.academicSessionId) {
    matchCriteria.academicSessionId = new mongoose.Types.ObjectId(filters.academicSessionId);
  }
  if (filters.classId) {
    matchCriteria.classId = new mongoose.Types.ObjectId(filters.classId);
  }
  if (filters.sectionId) {
    matchCriteria.sectionId = new mongoose.Types.ObjectId(filters.sectionId);
  }
  if (filters.studentId) {
    matchCriteria.studentId = new mongoose.Types.ObjectId(filters.studentId);
  }
  if (filters.startDate || filters.endDate) {
    matchCriteria.date = {};
    if (filters.startDate) matchCriteria.date.$gte = new Date(filters.startDate);
    if (filters.endDate) matchCriteria.date.$lte = new Date(filters.endDate);
  }

  // Aggregate attendance summary per student
  const aggregationPipeline = [
    { $match: matchCriteria },
    {
      $group: {
        _id: '$studentId',
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'PRESENT'] }, 1, 0] },
        },
        absentDays: {
          $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] },
        },
        lateDays: {
          $sum: { $cond: [{ $eq: ['$status', 'LATE'] }, 1, 0] },
        },
        halfDays: {
          $sum: { $cond: [{ $eq: ['$status', 'HALF_DAY'] }, 1, 0] },
        },
        excusedDays: {
          $sum: { $cond: [{ $eq: ['$status', 'EXCUSED'] }, 1, 0] },
        },
      },
    },
    { $sort: { presentDays: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const [studentSummaries, totalCountResult] = await Promise.all([
    Attendance.aggregate(aggregationPipeline),
    Attendance.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$studentId' } },
      { $count: 'total' },
    ]),
  ]);

  const total = totalCountResult[0]?.total || 0;

  // Enrich with student user details
  const studentIds = studentSummaries.map((s) => s._id);
  const students = await Student.find({ _id: { $in: studentIds } })
    .populate('userId', 'firstName lastName email')
    .lean();

  const studentMap = new Map();
  for (const s of students) {
    studentMap.set(s._id.toString(), s);
  }

  const reports = studentSummaries.map((item) => {
    const student = studentMap.get(item._id.toString());
    const presentEquivalent = item.presentDays + (item.lateDays * 0.5) + (item.halfDays * 0.5);
    const attendancePercentage = item.totalDays > 0
      ? Number(((presentEquivalent / item.totalDays) * 100).toFixed(2))
      : 0;

    return {
      studentId: item._id,
      admissionNumber: student?.admissionNumber || '',
      firstName: student?.userId?.firstName || '',
      lastName: student?.userId?.lastName || '',
      totalDays: item.totalDays,
      presentDays: item.presentDays,
      absentDays: item.absentDays,
      lateDays: item.lateDays,
      halfDays: item.halfDays,
      excusedDays: item.excusedDays,
      attendancePercentage,
    };
  });

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Generate fee defaulters report.
 *
 * @param {string|mongoose.Types.ObjectId} schoolId
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export async function getFeeDefaultersReport(schoolId, filters = {}) {
  const schoolObjectId = typeof schoolId === 'string' ? new mongoose.Types.ObjectId(schoolId) : schoolId;
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;
  const minBalance = Number(filters.minBalance) || 0;

  const matchCriteria = {
    schoolId: schoolObjectId,
    balanceAmount: { $gt: minBalance },
    status: { $in: ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'] },
    isDeleted: { $ne: true },
  };

  if (filters.academicSessionId) {
    matchCriteria.academicSessionId = filters.academicSessionId;
  }
  if (filters.classId) {
    matchCriteria.classId = filters.classId;
  }
  if (filters.sectionId) {
    matchCriteria.sectionId = filters.sectionId;
  }

  const [invoices, total] = await Promise.all([
    FeeInvoice.find(matchCriteria)
      .populate({
        path: 'studentId',
        select: 'admissionNumber userId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone',
        },
      })
      .populate('classId', 'name code')
      .populate('sectionId', 'name code')
      .sort({ dueDate: 1, balanceAmount: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FeeInvoice.countDocuments(matchCriteria),
  ]);

  const now = new Date();
  const defaulters = invoices.map((inv) => {
    const isOverdue = inv.dueDate ? new Date(inv.dueDate) < now : false;
    const daysOverdue = isOverdue && inv.dueDate
      ? Math.floor((now - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      invoiceId: inv._id,
      invoiceNumber: inv.invoiceNumber,
      studentId: inv.studentId?._id,
      admissionNumber: inv.studentId?.admissionNumber,
      studentName: `${inv.studentId?.userId?.firstName || ''} ${inv.studentId?.userId?.lastName || ''}`.trim(),
      parentPhone: inv.studentId?.userId?.phone || null,
      class: inv.classId?.name || '',
      section: inv.sectionId?.name || '',
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      balanceAmount: inv.balanceAmount,
      dueDate: inv.dueDate,
      isOverdue,
      daysOverdue,
      status: inv.status,
    };
  });

  return {
    defaulters,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Generate a student academic report card.
 *
 * @param {string|mongoose.Types.ObjectId} schoolId
 * @param {string|mongoose.Types.ObjectId} studentId
 * @param {Object} filters
 * @returns {Promise<Object>}
 */
export async function getAcademicReportCard(schoolId, studentId, filters = {}) {
  const schoolObjectId = typeof schoolId === 'string' ? new mongoose.Types.ObjectId(schoolId) : schoolId;
  const studentObjectId = typeof studentId === 'string' ? new mongoose.Types.ObjectId(studentId) : studentId;

  // 1. Fetch student info
  const student = await Student.findOne({ _id: studentObjectId, schoolId: schoolObjectId, isDeleted: { $ne: true } })
    .populate('userId', 'firstName lastName email')
    .lean();

  if (!student) {
    throw AppError.notFound('Student not found in this school');
  }

  // 2. Fetch academic results
  const resultQuery = {
    schoolId: schoolObjectId,
    studentId: studentObjectId,
    isDeleted: { $ne: true },
  };
  if (filters.academicSessionId) {
    resultQuery.academicSessionId = filters.academicSessionId;
  }
  if (filters.examId) {
    resultQuery.examId = filters.examId;
  }

  const results = await Result.find(resultQuery)
    .populate('examId', 'name examType startDate endDate')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('academicSessionId', 'name')
    .lean();

  // 3. Compute overall performance
  let totalMarksPossible = 0;
  let totalMarksObtained = 0;
  let allPassed = true;

  const examsSummary = results.map((r) => {
    totalMarksPossible += r.totalMarks || 0;
    totalMarksObtained += r.marksObtained || 0;
    if (!r.isPassed) allPassed = false;

    return {
      resultId: r._id,
      examName: r.examId?.name || 'Exam',
      marksObtained: r.marksObtained,
      totalMarks: r.totalMarks,
      percentage: r.percentage,
      grade: r.grade,
      gpa: r.gpa,
      isPassed: r.isPassed,
      paperMarks: r.papers || [],
    };
  });

  const cumulativePercentage = totalMarksPossible > 0
    ? Number(((totalMarksObtained / totalMarksPossible) * 100).toFixed(2))
    : 0;

  return {
    student: {
      id: student._id,
      admissionNumber: student.admissionNumber,
      name: `${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`.trim(),
      email: student.userId?.email,
      gender: student.gender,
    },
    performance: {
      totalExams: results.length,
      totalMarksPossible,
      totalMarksObtained,
      cumulativePercentage,
      overallStatus: allPassed && results.length > 0 ? 'PASSED' : results.length > 0 ? 'FAILED' : 'NO_RESULTS',
    },
    results: examsSummary,
  };
}
