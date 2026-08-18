import mongoose from 'mongoose';
import { ENROLLMENT_STATUS, ENROLLMENT_STATUS_VALUES } from '../../constants/index.js';

const enrollmentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: [true, 'Academic session ID is required'],
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section ID is required'],
      index: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      default: null,
      maxlength: [50, 'Roll number cannot exceed 50 characters'],
    },
    enrollmentStatus: {
      type: String,
      enum: {
        values: ENROLLMENT_STATUS_VALUES,
        message: 'Invalid enrollment status: {VALUE}',
      },
      default: ENROLLMENT_STATUS.ACTIVE,
    },
    promotionStatus: {
      type: String,
      enum: {
        values: ['ENROLLED', 'PROMOTED', 'RETAINED', 'GRADUATED', 'TRANSFERRED', 'WITHDRAWN'],
        message: 'Invalid promotion status: {VALUE}',
      },
      default: 'ENROLLED',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for historical tracking, uniqueness, and class rosters
enrollmentSchema.index({ schoolId: 1, studentId: 1, academicSessionId: 1 }, { unique: true });
enrollmentSchema.index({ schoolId: 1, academicSessionId: 1, classId: 1, sectionId: 1 });
enrollmentSchema.index({ schoolId: 1, enrollmentStatus: 1 });
enrollmentSchema.index({ schoolId: 1, promotionStatus: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
