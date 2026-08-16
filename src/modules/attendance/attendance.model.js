import mongoose from 'mongoose';
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_VALUES,
  ATTENDANCE_SOURCE,
  ATTENDANCE_SOURCE_VALUES,
} from '../../constants/index.js';

const attendanceSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: [true, 'Academic session ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
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
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ATTENDANCE_STATUS_VALUES,
        message: 'Invalid attendance status: {VALUE}',
      },
      default: ATTENDANCE_STATUS.PRESENT,
      required: [true, 'Attendance status is required'],
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [250, 'Remarks cannot exceed 250 characters'],
      default: null,
    },
    source: {
      type: String,
      enum: {
        values: ATTENDANCE_SOURCE_VALUES,
        message: 'Invalid attendance source: {VALUE}',
      },
      default: ATTENDANCE_SOURCE.MANUAL,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    correctedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    correctedAt: {
      type: Date,
      default: null,
    },
    correctionReason: {
      type: String,
      trim: true,
      maxlength: [250, 'Correction reason cannot exceed 250 characters'],
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
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
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
        delete ret.isDeleted;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
        return ret;
      },
    },
  }
);

// Indexes
// A student can have only one attendance record per school, session, and date
attendanceSchema.index(
  { schoolId: 1, academicSessionId: 1, studentId: 1, date: 1 },
  { unique: true }
);

attendanceSchema.index({ schoolId: 1, classId: 1, sectionId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, date: 1, status: 1 });
attendanceSchema.index({ schoolId: 1, studentId: 1, status: 1 });

// Soft-delete query filter
attendanceSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
