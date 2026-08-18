import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Enrollment from '../../src/modules/students/enrollment.model.js';
import Student from '../../src/modules/students/student.model.js';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import PromotionHistory from '../../src/modules/promotions/promotionHistory.model.js';
import { PROMOTION_STATUS, ROLES, ENROLLMENT_STATUS, SESSION_STATUS } from '../../src/constants/index.js';
import {
  getPromotionPreviewSchema,
  bulkPromoteSchema,
  queryPromotionHistorySchema,
} from '../../src/modules/promotions/promotion.validator.js';

describe('Academic Session & Student Promotion System Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sourceSessionId = '507f1f77bcf86cd799439022';
  const destSessionId = '507f1f77bcf86cd799439033';
  const sourceClassId = '507f1f77bcf86cd799439044';
  const destClassId = '507f1f77bcf86cd799439055';
  const sourceSectionId = '507f1f77bcf86cd799439066';
  const destSectionId = '507f1f77bcf86cd799439077';
  const student1Id = '507f1f77bcf86cd799439088';
  const student2Id = '507f1f77bcf86cd799439099';

  describe('1. Models & Schemas Verification', () => {
    it('should verify Enrollment schema has unique index on schoolId + studentId + academicSessionId', () => {
      const indexes = Enrollment.schema.indexes();
      const uniqueSessionIndex = indexes.find(
        (idx) =>
          idx[0].schoolId === 1 &&
          idx[0].studentId === 1 &&
          idx[0].academicSessionId === 1 &&
          idx[1]?.unique === true
      );

      assert.ok(uniqueSessionIndex, 'Enrollment must have unique index on schoolId + studentId + academicSessionId');
    });

    it('should verify PromotionHistory schema fields and indexes', () => {
      const history = new PromotionHistory({
        schoolId,
        batchId: 'BATCH-UUID-12345',
        studentId: student1Id,
        fromAcademicSessionId: sourceSessionId,
        toAcademicSessionId: destSessionId,
        fromClassId: sourceClassId,
        toClassId: destClassId,
        fromSectionId: sourceSectionId,
        toSectionId: destSectionId,
        promotionStatus: PROMOTION_STATUS.PROMOTED,
        previousRollNumber: '01',
        newRollNumber: '05',
        reason: 'Passed final term with distinction',
        performedBy: '507f1f77bcf86cd7994390aa',
      });

      assert.equal(history.batchId, 'BATCH-UUID-12345');
      assert.equal(history.promotionStatus, 'PROMOTED');
      assert.equal(history.previousRollNumber, '01');
      assert.equal(history.newRollNumber, '05');
      assert.ok(history.performedAt instanceof Date);
    });

    it('should verify AcademicSession lifecycle status constants', () => {
      assert.equal(SESSION_STATUS.UPCOMING, 'UPCOMING');
      assert.equal(SESSION_STATUS.ACTIVE, 'ACTIVE');
      assert.equal(SESSION_STATUS.COMPLETED, 'COMPLETED');
      assert.equal(SESSION_STATUS.ARCHIVED, 'ARCHIVED');
    });
  });

  describe('2. Promotion Validators Verification', () => {
    it('should validate correct getPromotionPreview request', () => {
      const validPayload = {
        sourceAcademicSessionId: sourceSessionId,
        destinationAcademicSessionId: destSessionId,
        sourceClassId,
        sourceSectionId,
        destinationClassId: destClassId,
        destinationSectionId: destSectionId,
      };

      const parsed = getPromotionPreviewSchema.parse(validPayload);
      assert.equal(parsed.sourceAcademicSessionId, sourceSessionId);
      assert.equal(parsed.destinationAcademicSessionId, destSessionId);
    });

    it('should reject promotion preview if source and destination sessions are identical', () => {
      const invalidPayload = {
        sourceAcademicSessionId: sourceSessionId,
        destinationAcademicSessionId: sourceSessionId, // Same!
        sourceClassId,
        sourceSectionId,
      };

      assert.throws(() => {
        getPromotionPreviewSchema.parse(invalidPayload);
      });
    });

    it('should validate bulk promotion payload with multiple student status decisions', () => {
      const bulkPayload = {
        sourceAcademicSessionId: sourceSessionId,
        destinationAcademicSessionId: destSessionId,
        sourceClassId,
        sourceSectionId,
        destinationClassId: destClassId,
        destinationSectionId: destSectionId,
        allowCapacityOverride: false,
        promotions: [
          {
            studentId: student1Id,
            promotionStatus: 'PROMOTED',
            targetClassId: destClassId,
            targetSectionId: destSectionId,
            newRollNumber: '10',
          },
          {
            studentId: student2Id,
            promotionStatus: 'RETAINED',
            targetClassId: sourceClassId,
            targetSectionId: sourceSectionId,
            reason: 'Needs to repeat grade',
          },
        ],
      };

      const parsed = bulkPromoteSchema.parse(bulkPayload);
      assert.equal(parsed.promotions.length, 2);
      assert.equal(parsed.promotions[0].promotionStatus, 'PROMOTED');
      assert.equal(parsed.promotions[1].promotionStatus, 'RETAINED');
    });

    it('should reject bulk promotion with empty student list', () => {
      const emptyPayload = {
        sourceAcademicSessionId: sourceSessionId,
        destinationAcademicSessionId: destSessionId,
        sourceClassId,
        sourceSectionId,
        promotions: [],
      };

      assert.throws(() => {
        bulkPromoteSchema.parse(emptyPayload);
      });
    });
  });

  describe('3. Multi-Session Student Identity & Historical Invariance Logic', () => {
    it('should maintain permanent Student document while creating new Enrollment per session', () => {
      // 1. Permanent student
      const student = new Student({
        _id: new mongoose.Types.ObjectId(student1Id),
        schoolId,
        admissionNumber: 'ADM-2026-001',
        firstName: 'Ahmed',
        lastName: 'Khan',
        dateOfBirth: new Date('2012-05-15'),
        academicSessionId: sourceSessionId,
        classId: sourceClassId,
        sectionId: sourceSectionId,
        rollNumber: '01',
        enrollmentStatus: ENROLLMENT_STATUS.ACTIVE,
      });

      // 2. 2026-2027 Enrollment
      const enrollment2026 = new Enrollment({
        schoolId,
        studentId: student._id,
        academicSessionId: sourceSessionId,
        classId: sourceClassId,
        sectionId: sourceSectionId,
        rollNumber: '01',
        enrollmentStatus: ENROLLMENT_STATUS.ACTIVE,
        promotionStatus: 'PROMOTED',
        leftAt: new Date('2027-06-30'),
      });

      // 3. 2027-2028 Promoted Enrollment
      const enrollment2027 = new Enrollment({
        schoolId,
        studentId: student._id,
        academicSessionId: destSessionId,
        classId: destClassId,
        sectionId: destSectionId,
        rollNumber: '05',
        enrollmentStatus: ENROLLMENT_STATUS.ACTIVE,
        promotionStatus: 'ENROLLED',
      });

      // Student active pointer updated to destination session
      student.academicSessionId = destSessionId;
      student.classId = destClassId;
      student.sectionId = destSectionId;
      student.rollNumber = '05';

      assert.equal(student.admissionNumber, 'ADM-2026-001');
      assert.equal(student.academicSessionId.toString(), destSessionId);
      assert.equal(enrollment2026.academicSessionId.toString(), sourceSessionId);
      assert.equal(enrollment2026.classId.toString(), sourceClassId);
      assert.equal(enrollment2026.promotionStatus, 'PROMOTED');
      assert.equal(enrollment2027.academicSessionId.toString(), destSessionId);
      assert.equal(enrollment2027.classId.toString(), destClassId);
    });

    it('should retain student in same class level while assigning new session enrollment', () => {
      const student = new Student({
        _id: new mongoose.Types.ObjectId(student2Id),
        schoolId,
        admissionNumber: 'ADM-2026-002',
        firstName: 'Bilal',
        lastName: 'Ahmed',
        dateOfBirth: new Date('2012-08-20'),
        academicSessionId: sourceSessionId,
        classId: sourceClassId,
        sectionId: sourceSectionId,
        rollNumber: '02',
        enrollmentStatus: ENROLLMENT_STATUS.ACTIVE,
      });

      const retainedEnrollment = new Enrollment({
        schoolId,
        studentId: student._id,
        academicSessionId: destSessionId,
        classId: sourceClassId, // Same class level
        sectionId: sourceSectionId,
        rollNumber: '02',
        enrollmentStatus: ENROLLMENT_STATUS.ACTIVE,
        promotionStatus: 'ENROLLED',
      });

      assert.equal(retainedEnrollment.academicSessionId.toString(), destSessionId);
      assert.equal(retainedEnrollment.classId.toString(), sourceClassId);
    });
  });
});
