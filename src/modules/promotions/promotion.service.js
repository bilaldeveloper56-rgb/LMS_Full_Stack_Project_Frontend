import crypto from 'node:crypto';
import mongoose from 'mongoose';
import PromotionHistory from './promotionHistory.model.js';
import Enrollment from '../students/enrollment.model.js';
import Student from '../students/student.model.js';
import AcademicSession from '../academics/academicSession.model.js';
import Class from '../academics/class.model.js';
import Section from '../academics/section.model.js';
import Result from '../results/result.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { ROLES, PROMOTION_STATUS, AUTH_EVENTS } from '../../constants/index.js';
import { logAuditEvent } from '../audit/audit.service.js';

function resolveSchoolId(user, explicitSchoolId) {
  if (user.role === ROLES.SUPER_ADMIN) {
    return explicitSchoolId || user.schoolId || null;
  }
  return user.schoolId;
}

/**
 * Get Promotion Preview with candidate student roster, capacity metrics, and warnings.
 *
 * @param {Object} data - Preview query parameters
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} Preview payload
 */
export async function getPromotionPreview(data, user) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  const {
    sourceAcademicSessionId,
    destinationAcademicSessionId,
    sourceClassId,
    sourceSectionId,
    destinationClassId,
    destinationSectionId,
  } = data;

  // 1. Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // 2. Verify source & destination sessions
  const [sourceSession, destSession] = await Promise.all([
    AcademicSession.findOne({ _id: sourceAcademicSessionId, schoolId }),
    AcademicSession.findOne({ _id: destinationAcademicSessionId, schoolId }),
  ]);

  if (!sourceSession) {
    throw AppError.notFound('Source academic session not found in this school');
  }
  if (!destSession) {
    throw AppError.notFound('Destination academic session not found in this school');
  }

  // 3. Verify source class & section
  const [sourceClass, sourceSection] = await Promise.all([
    Class.findOne({ _id: sourceClassId, schoolId }),
    Section.findOne({ _id: sourceSectionId, classId: sourceClassId, schoolId }),
  ]);

  if (!sourceClass) {
    throw AppError.notFound('Source class not found in this school');
  }
  if (!sourceSection) {
    throw AppError.notFound('Source section not found or does not belong to the source class');
  }

  // 4. Verify destination class & section (if provided)
  let destClass = null;
  let destSection = null;
  let destCapacity = 40;
  let currentEnrolledInDest = 0;
  let availableCapacity = 40;

  if (destinationClassId && destinationSectionId) {
    [destClass, destSection] = await Promise.all([
      Class.findOne({ _id: destinationClassId, schoolId }),
      Section.findOne({ _id: destinationSectionId, classId: destinationClassId, schoolId }),
    ]);

    if (!destClass) {
      throw AppError.notFound('Destination class not found in this school');
    }
    if (!destSection) {
      throw AppError.notFound('Destination section not found or does not belong to the destination class');
    }

    destCapacity = destSection.capacity || 40;
    currentEnrolledInDest = await Enrollment.countDocuments({
      schoolId,
      academicSessionId: destinationAcademicSessionId,
      sectionId: destinationSectionId,
      enrollmentStatus: 'ACTIVE',
    });
    availableCapacity = Math.max(0, destCapacity - currentEnrolledInDest);
  }

  // 5. Fetch students actively enrolled in source session/class/section
  const sourceEnrollments = await Enrollment.find({
    schoolId,
    academicSessionId: sourceAcademicSessionId,
    classId: sourceClassId,
    sectionId: sourceSectionId,
    enrollmentStatus: 'ACTIVE',
  })
    .populate('studentId')
    .sort({ rollNumber: 1, createdAt: 1 });

  // 6. Enrich candidate students with existing destination enrollment and exam outcomes
  const candidates = await Promise.all(
    sourceEnrollments.map(async (enr) => {
      const st = enr.studentId;
      if (!st || st.isDeleted) return null;

      // Check if already enrolled in destination session
      const alreadyEnrolled = await Enrollment.findOne({
        schoolId,
        studentId: st._id,
        academicSessionId: destinationAcademicSessionId,
      }).populate('classId', 'name').populate('sectionId', 'name');

      // Fetch summary of student results in source session
      const studentResults = await Result.find({
        schoolId,
        academicSessionId: sourceAcademicSessionId,
        studentId: st._id,
      });

      let resultsSummary = {
        hasResults: studentResults.length > 0,
        totalSubjectsTested: studentResults.length,
        averagePercentage: null,
        suggestedStatus: PROMOTION_STATUS.PROMOTED,
      };

      if (studentResults.length > 0) {
        const totalMarksObtained = studentResults.reduce((acc, r) => acc + (r.marksObtained || 0), 0);
        const totalMaxMarks = studentResults.reduce((acc, r) => acc + (r.maxMarks || 100), 0);
        const avg = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
        resultsSummary.averagePercentage = Math.round(avg * 10) / 10;

        // If average is below 40%, suggest RETAINED
        if (avg < 40) {
          resultsSummary.suggestedStatus = PROMOTION_STATUS.RETAINED;
        }
      }

      return {
        studentId: st._id,
        admissionNumber: st.admissionNumber,
        firstName: st.firstName,
        lastName: st.lastName,
        gender: st.gender,
        currentRollNumber: enr.rollNumber || st.rollNumber || null,
        alreadyEnrolledInDestination: Boolean(alreadyEnrolled),
        existingDestinationEnrollment: alreadyEnrolled
          ? {
              classId: alreadyEnrolled.classId?._id,
              className: alreadyEnrolled.classId?.name,
              sectionId: alreadyEnrolled.sectionId?._id,
              sectionName: alreadyEnrolled.sectionId?.name,
              status: alreadyEnrolled.enrollmentStatus,
            }
          : null,
        resultsSummary,
        warnings: [
          ...(alreadyEnrolled ? ['Already enrolled in destination session'] : []),
          ...(studentResults.length === 0 ? ['No recorded exam results in current session'] : []),
        ],
      };
    })
  );

  const filteredCandidates = candidates.filter(Boolean);

  return {
    sourceSession: { id: sourceSession._id, name: sourceSession.name, status: sourceSession.status },
    destinationSession: { id: destSession._id, name: destSession.name, status: destSession.status },
    sourceClass: { id: sourceClass._id, name: sourceClass.name, code: sourceClass.code },
    sourceSection: { id: sourceSection._id, name: sourceSection.name, code: sourceSection.code },
    destinationClass: destClass ? { id: destClass._id, name: destClass.name, code: destClass.code } : null,
    destinationSection: destSection
      ? {
          id: destSection._id,
          name: destSection.name,
          code: destSection.code,
          capacity: destCapacity,
          currentEnrolled: currentEnrolledInDest,
          availableCapacity,
        }
      : null,
    totalCandidates: filteredCandidates.length,
    candidates: filteredCandidates,
  };
}

/**
 * Execute Bulk Student Promotion between academic sessions.
 *
 * @param {Object} data - Bulk promotion payload
 * @param {Object} user - Performing authenticated user
 * @param {Object} [meta] - Audit metadata
 * @returns {Promise<Object>} Execution receipt
 */
export async function executeBulkPromotion(data, user, meta = {}) {
  const schoolId = resolveSchoolId(user, data.schoolId);
  if (!schoolId) {
    throw AppError.badRequest('School context is required');
  }

  const {
    sourceAcademicSessionId,
    destinationAcademicSessionId,
    sourceClassId,
    sourceSectionId,
    destinationClassId,
    destinationSectionId,
    allowCapacityOverride = false,
    promotions = [],
  } = data;

  if (!promotions || promotions.length === 0) {
    throw AppError.badRequest('At least one student must be selected for promotion');
  }

  // 1. Verify school
  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) {
    throw AppError.notFound('School not found');
  }

  // 2. Verify sessions
  const [sourceSession, destSession] = await Promise.all([
    AcademicSession.findOne({ _id: sourceAcademicSessionId, schoolId }),
    AcademicSession.findOne({ _id: destinationAcademicSessionId, schoolId }),
  ]);

  if (!sourceSession || !destSession) {
    throw AppError.notFound('Source or destination academic session not found in this school');
  }

  const batchId = crypto.randomUUID();
  const promotionResults = [];
  const counts = {
    promoted: 0,
    retained: 0,
    graduated: 0,
    transferred: 0,
    withdrawn: 0,
  };

  // 3. Check section capacities for incoming promoted/retained students
  const sectionIncomingCounts = new Map();

  for (const item of promotions) {
    const status = item.promotionStatus || PROMOTION_STATUS.PROMOTED;
    if (status === PROMOTION_STATUS.PROMOTED || status === PROMOTION_STATUS.RETAINED) {
      const targetSecId =
        status === PROMOTION_STATUS.PROMOTED
          ? item.targetSectionId || destinationSectionId
          : item.targetSectionId || sourceSectionId;

      if (targetSecId) {
        sectionIncomingCounts.set(
          targetSecId.toString(),
          (sectionIncomingCounts.get(targetSecId.toString()) || 0) + 1
        );
      }
    }
  }

  if (!allowCapacityOverride) {
    for (const [secId, incomingCount] of sectionIncomingCounts.entries()) {
      const sec = await Section.findOne({ _id: secId, schoolId });
      if (sec && sec.capacity) {
        const currentActive = await Enrollment.countDocuments({
          schoolId,
          academicSessionId: destinationAcademicSessionId,
          sectionId: sec._id,
          enrollmentStatus: 'ACTIVE',
        });

        if (currentActive + incomingCount > sec.capacity) {
          throw AppError.badRequest(
            `Section '${sec.name}' exceeds capacity of ${sec.capacity}. Current: ${currentActive}, Incoming: ${incomingCount}. Please enable administrative capacity override to proceed.`
          );
        }
      }
    }
  }

  // 4. Execute Promotion per student
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
  } catch (err) {
    // Transactions not supported on standalone local MongoDB instance
    session = null;
  }

  try {
    for (const item of promotions) {
      const studentId = item.studentId;
      const status = item.promotionStatus || PROMOTION_STATUS.PROMOTED;

      const studentQuery = { _id: studentId, schoolId };
      const student = session
        ? await Student.findOne(studentQuery).session(session)
        : await Student.findOne(studentQuery);

      if (!student) {
        throw AppError.notFound(`Student with ID '${studentId}' not found in this school`);
      }

      // Check if student already has enrollment in destination session
      const destEnrollmentQuery = {
        schoolId,
        studentId,
        academicSessionId: destinationAcademicSessionId,
      };

      const existingDest = session
        ? await Enrollment.findOne(destEnrollmentQuery).session(session)
        : await Enrollment.findOne(destEnrollmentQuery);

      if (existingDest) {
        throw AppError.conflict(
          `Student '${student.firstName} ${student.lastName}' (${student.admissionNumber}) is already enrolled in the destination academic session`
        );
      }

      // Determine target class and section based on promotion status
      let targetClassId;
      let targetSectionId;

      if (status === PROMOTION_STATUS.PROMOTED) {
        targetClassId = item.targetClassId || destinationClassId;
        targetSectionId = item.targetSectionId || destinationSectionId;
      } else if (status === PROMOTION_STATUS.RETAINED) {
        targetClassId = item.targetClassId || sourceClassId;
        targetSectionId = item.targetSectionId || sourceSectionId;
      } else {
        // GRADUATED, TRANSFERRED, WITHDRAWN
        targetClassId = sourceClassId;
        targetSectionId = sourceSectionId;
      }

      if ((status === PROMOTION_STATUS.PROMOTED || status === PROMOTION_STATUS.RETAINED) && (!targetClassId || !targetSectionId)) {
        throw AppError.badRequest(
          `Target class and section are required for student '${student.admissionNumber}' with status '${status}'`
        );
      }

      // Mark source enrollment with leftAt and promotionStatus
      const sourceEnrollmentQuery = {
        schoolId,
        studentId,
        academicSessionId: sourceAcademicSessionId,
      };

      const sourceEnrollment = session
        ? await Enrollment.findOne(sourceEnrollmentQuery).session(session)
        : await Enrollment.findOne(sourceEnrollmentQuery);

      if (sourceEnrollment) {
        sourceEnrollment.leftAt = new Date();
        sourceEnrollment.promotionStatus = status;
        if (session) {
          await sourceEnrollment.save({ session });
        } else {
          await sourceEnrollment.save();
        }
      }

      // If PROMOTED or RETAINED: create new destination enrollment and update student active pointers
      if (status === PROMOTION_STATUS.PROMOTED || status === PROMOTION_STATUS.RETAINED) {
        const newEnrollment = new Enrollment({
          schoolId,
          studentId,
          academicSessionId: destinationAcademicSessionId,
          classId: targetClassId,
          sectionId: targetSectionId,
          rollNumber: item.newRollNumber || student.rollNumber || null,
          enrollmentStatus: 'ACTIVE',
          promotionStatus: 'ENROLLED',
          enrolledAt: new Date(),
          createdBy: user.id,
          updatedBy: user.id,
        });

        if (session) {
          await newEnrollment.save({ session });
        } else {
          await newEnrollment.save();
        }

        // Update permanent student active pointers
        student.academicSessionId = destinationAcademicSessionId;
        student.classId = targetClassId;
        student.sectionId = targetSectionId;
        if (item.newRollNumber) {
          student.rollNumber = item.newRollNumber;
        }
        student.enrollmentStatus = 'ACTIVE';
        student.updatedBy = user.id;

        if (session) {
          await student.save({ session });
        } else {
          await student.save();
        }
      } else {
        // If GRADUATED / TRANSFERRED / WITHDRAWN: update permanent student status
        student.enrollmentStatus = status;
        student.updatedBy = user.id;

        if (session) {
          await student.save({ session });
        } else {
          await student.save();
        }
      }

      // Record immutable promotion audit history
      const historyRecord = new PromotionHistory({
        schoolId,
        batchId,
        studentId,
        fromAcademicSessionId: sourceAcademicSessionId,
        toAcademicSessionId: destinationAcademicSessionId,
        fromClassId: sourceClassId,
        toClassId: targetClassId,
        fromSectionId: sourceSectionId,
        toSectionId: targetSectionId,
        promotionStatus: status,
        previousRollNumber: student.rollNumber || null,
        newRollNumber: item.newRollNumber || null,
        reason: item.reason || null,
        performedBy: user.id,
        performedAt: new Date(),
      });

      if (session) {
        await historyRecord.save({ session });
      } else {
        await historyRecord.save();
      }

      promotionResults.push({
        studentId,
        admissionNumber: student.admissionNumber,
        name: `${student.firstName} ${student.lastName}`,
        promotionStatus: status,
        targetClassId,
        targetSectionId,
      });

      if (status === PROMOTION_STATUS.PROMOTED) counts.promoted++;
      else if (status === PROMOTION_STATUS.RETAINED) counts.retained++;
      else if (status === PROMOTION_STATUS.GRADUATED) counts.graduated++;
      else if (status === PROMOTION_STATUS.TRANSFERRED) counts.transferred++;
      else if (status === PROMOTION_STATUS.WITHDRAWN) counts.withdrawn++;
    }

    if (session) {
      await session.commitTransaction();
    }
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    if (session) {
      session.endSession();
    }
  }

  // 5. Log platform audit event
  await logAuditEvent({
    event: AUTH_EVENTS.BULK_STUDENT_PROMOTION,
    userId: user.id,
    schoolId,
    entityType: 'PromotionHistory',
    entityId: new mongoose.Types.ObjectId(),
    details: {
      batchId,
      sourceAcademicSessionId,
      destinationAcademicSessionId,
      sourceClassId,
      sourceSectionId,
      destinationClassId,
      destinationSectionId,
      totalPromoted: counts.promoted,
      totalRetained: counts.retained,
      totalGraduated: counts.graduated,
      totalTransferred: counts.transferred,
      totalProcessed: promotionResults.length,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return {
    batchId,
    totalProcessed: promotionResults.length,
    counts,
    promotions: promotionResults,
  };
}

/**
 * Get Paginated Promotion History.
 *
 * @param {Object} params - Query filters & pagination
 * @param {Object} user - Authenticated user
 * @returns {Promise<Object>} History and pagination
 */
export async function getPromotionHistory(params, user) {
  const {
    page = 1,
    limit = 10,
    studentId,
    fromAcademicSessionId,
    toAcademicSessionId,
    fromClassId,
    toClassId,
    promotionStatus,
    batchId,
    search,
    schoolId: querySchoolId,
    sortBy = 'performedAt',
    sortOrder = 'desc',
  } = params;

  const targetSchoolId = resolveSchoolId(user, querySchoolId);
  const query = {};

  if (targetSchoolId) {
    query.schoolId = targetSchoolId;
  }

  if (studentId) query.studentId = studentId;
  if (fromAcademicSessionId) query.fromAcademicSessionId = fromAcademicSessionId;
  if (toAcademicSessionId) query.toAcademicSessionId = toAcademicSessionId;
  if (fromClassId) query.fromClassId = fromClassId;
  if (toClassId) query.toClassId = toClassId;
  if (promotionStatus) query.promotionStatus = promotionStatus;
  if (batchId) query.batchId = batchId;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [historyRecords, total] = await Promise.all([
    PromotionHistory.find(query)
      .populate('studentId', 'admissionNumber firstName lastName gender email profileImage')
      .populate('fromAcademicSessionId', 'name status')
      .populate('toAcademicSessionId', 'name status')
      .populate('fromClassId', 'name code')
      .populate('toClassId', 'name code')
      .populate('fromSectionId', 'name code')
      .populate('toSectionId', 'name code')
      .populate('performedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    PromotionHistory.countDocuments(query),
  ]);

  return {
    history: historyRecords.map((h) => h.toJSON()),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
