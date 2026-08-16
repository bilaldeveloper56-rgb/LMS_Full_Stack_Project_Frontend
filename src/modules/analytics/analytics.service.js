import mongoose from 'mongoose';
import Student from '../students/student.model.js';
import Teacher from '../teachers/teacher.model.js';
import Class from '../academics/class.model.js';
import Section from '../academics/section.model.js';
import Attendance from '../attendance/attendance.model.js';
import FeeInvoice from '../fees/feeInvoice.model.js';
import FeePayment from '../fees/feePayment.model.js';
import Assignment from '../assignments/assignment.model.js';
import AssignmentSubmission from '../assignments/assignmentSubmission.model.js';
import Result from '../results/result.model.js';
import School from '../schools/school.model.js';
import User from '../users/user.model.js';
import AuditLog from '../audit/auditLog.model.js';
import { ENROLLMENT_STATUS, EMPLOYMENT_STATUS } from '../../constants/index.js';

/**
 * Get comprehensive school-level KPI and dashboard analytics.
 * Strictly scoped by schoolId.
 *
 * @param {string|mongoose.Types.ObjectId} schoolId
 * @param {Object} [filters]
 * @returns {Promise<Object>}
 */
export async function getSchoolAnalytics(schoolId, filters = {}) {
  const schoolObjectId = typeof schoolId === 'string' ? new mongoose.Types.ObjectId(schoolId) : schoolId;

  // 1. Student & Demographics Metrics
  const studentStats = await Student.aggregate([
    { $match: { schoolId: schoolObjectId, isDeleted: { $ne: true } } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        activeStudents: {
          $sum: { $cond: [{ $eq: ['$enrollmentStatus', ENROLLMENT_STATUS.ACTIVE] }, 1, 0] },
        },
        maleStudents: {
          $sum: { $cond: [{ $eq: ['$gender', 'MALE'] }, 1, 0] },
        },
        femaleStudents: {
          $sum: { $cond: [{ $eq: ['$gender', 'FEMALE'] }, 1, 0] },
        },
        otherStudents: {
          $sum: { $cond: [{ $eq: ['$gender', 'OTHER'] }, 1, 0] },
        },
      },
    },
  ]);

  const demographics = studentStats[0] || {
    totalStudents: 0,
    activeStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    otherStudents: 0,
  };
  delete demographics._id;

  // 2. Staff & Academic Structure Counts
  const [totalTeachers, totalClasses, totalSections] = await Promise.all([
    Teacher.countDocuments({
      schoolId: schoolObjectId,
      employmentStatus: EMPLOYMENT_STATUS.ACTIVE,
      isDeleted: { $ne: true },
    }),
    Class.countDocuments({ schoolId: schoolObjectId, isDeleted: { $ne: true } }),
    Section.countDocuments({ schoolId: schoolObjectId, isDeleted: { $ne: true } }),
  ]);

  const studentTeacherRatio = totalTeachers > 0
    ? Number((demographics.activeStudents / totalTeachers).toFixed(1))
    : 0;

  // 3. Attendance Analytics
  const attendanceMatch = { schoolId: schoolObjectId, isDeleted: { $ne: true } };
  if (filters.startDate || filters.endDate) {
    attendanceMatch.date = {};
    if (filters.startDate) attendanceMatch.date.$gte = new Date(filters.startDate);
    if (filters.endDate) attendanceMatch.date.$lte = new Date(filters.endDate);
  }

  const attendanceStats = await Attendance.aggregate([
    { $match: attendanceMatch },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const attendanceBreakdown = {
    PRESENT: 0,
    ABSENT: 0,
    LATE: 0,
    HALF_DAY: 0,
    EXCUSED: 0,
    totalRecords: 0,
    attendanceRatePercentage: 0,
  };

  for (const item of attendanceStats) {
    if (attendanceBreakdown[item._id] !== undefined) {
      attendanceBreakdown[item._id] = item.count;
    }
    attendanceBreakdown.totalRecords += item.count;
  }

  if (attendanceBreakdown.totalRecords > 0) {
    const presentEquivalent = attendanceBreakdown.PRESENT + (attendanceBreakdown.LATE * 0.5) + (attendanceBreakdown.HALF_DAY * 0.5);
    attendanceBreakdown.attendanceRatePercentage = Number(
      ((presentEquivalent / attendanceBreakdown.totalRecords) * 100).toFixed(2)
    );
  }

  // 4. Financial & Fee Invoicing Analytics
  const feeInvoiceMatch = { schoolId: schoolObjectId, isDeleted: { $ne: true } };
  if (filters.academicSessionId) {
    feeInvoiceMatch.academicSessionId = new mongoose.Types.ObjectId(filters.academicSessionId);
  }

  const financialStats = await FeeInvoice.aggregate([
    { $match: feeInvoiceMatch },
    {
      $group: {
        _id: null,
        totalInvoiced: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$paidAmount' },
        totalBalance: { $sum: '$balanceAmount' },
        totalDiscount: { $sum: '$discountAmount' },
        totalInvoices: { $sum: 1 },
        paidInvoices: {
          $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] },
        },
        unpaidInvoices: {
          $sum: { $cond: [{ $in: ['$status', ['UNPAID', 'OVERDUE']] }, 1, 0] },
        },
        partiallyPaidInvoices: {
          $sum: { $cond: [{ $eq: ['$status', 'PARTIALLY_PAID'] }, 1, 0] },
        },
      },
    },
  ]);

  const financials = financialStats[0] || {
    totalInvoiced: 0,
    totalPaid: 0,
    totalBalance: 0,
    totalDiscount: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    partiallyPaidInvoices: 0,
  };
  delete financials._id;

  financials.collectionRatePercentage = financials.totalInvoiced > 0
    ? Number(((financials.totalPaid / financials.totalInvoiced) * 100).toFixed(2))
    : 0;

  // 5. Academic & LMS Performance Analytics
  const [totalAssignments, totalSubmissions, resultStats] = await Promise.all([
    Assignment.countDocuments({ schoolId: schoolObjectId, isDeleted: { $ne: true } }),
    AssignmentSubmission.countDocuments({ schoolId: schoolObjectId, isDeleted: { $ne: true } }),
    Result.aggregate([
      { $match: { schoolId: schoolObjectId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          totalResults: { $sum: 1 },
          passedResults: {
            $sum: { $cond: [{ $eq: ['$isPassed', true] }, 1, 0] },
          },
          averagePercentage: { $avg: '$percentage' },
          averageGpa: { $avg: '$gpa' },
        },
      },
    ]),
  ]);

  const academic = {
    totalAssignments,
    totalSubmissions,
    totalResultsPublished: resultStats[0]?.totalResults || 0,
    passRatePercentage: resultStats[0]?.totalResults
      ? Number(((resultStats[0].passedResults / resultStats[0].totalResults) * 100).toFixed(2))
      : 0,
    averageGradePercentage: resultStats[0]?.averagePercentage
      ? Number(resultStats[0].averagePercentage.toFixed(2))
      : 0,
    averageGpa: resultStats[0]?.averageGpa
      ? Number(resultStats[0].averageGpa.toFixed(2))
      : 0,
  };

  return {
    demographics,
    academicStructure: {
      totalTeachers,
      totalClasses,
      totalSections,
      studentTeacherRatio,
    },
    attendance: attendanceBreakdown,
    financials,
    academic,
  };
}

/**
 * Get platform-wide analytics for Super Admin.
 *
 * @param {Object} [filters]
 * @returns {Promise<Object>}
 */
export async function getPlatformAnalytics(filters = {}) {
  // 1. Multi-Tenant School Metrics
  const schoolStats = await School.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const schoolOverview = {
    ACTIVE: 0,
    PENDING: 0,
    SUSPENDED: 0,
    INACTIVE: 0,
    totalSchools: 0,
  };

  for (const item of schoolStats) {
    if (schoolOverview[item._id] !== undefined) {
      schoolOverview[item._id] = item.count;
    }
    schoolOverview.totalSchools += item.count;
  }

  // 2. Global User Breakdown by Role
  const userStats = await User.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  const usersByRole = {
    SUPER_ADMIN: 0,
    SCHOOL_ADMIN: 0,
    TEACHER: 0,
    STUDENT: 0,
    PARENT: 0,
    ACCOUNTANT: 0,
    LIBRARIAN: 0,
    STAFF: 0,
    totalUsers: 0,
  };

  for (const item of userStats) {
    if (usersByRole[item._id] !== undefined) {
      usersByRole[item._id] = item.count;
    }
    usersByRole.totalUsers += item.count;
  }

  // 3. Platform Activity
  const totalAuditEvents = await AuditLog.countDocuments();

  return {
    schools: schoolOverview,
    users: usersByRole,
    systemActivity: {
      totalAuditEvents,
    },
  };
}
