import mongoose from 'mongoose';
import {
  LEAVE_STATUS,
  LEAVE_STATUS_VALUES,
  LEAVE_TYPE,
  LEAVE_TYPE_VALUES,
  LEAVE_DAY_TYPE,
  LEAVE_DAY_TYPE_VALUES,
} from '../../constants/index.js';

const leaveSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    applicantUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant user ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
      index: true,
    },
    leaveType: {
      type: String,
      enum: {
        values: LEAVE_TYPE_VALUES,
        message: 'Invalid leave type: {VALUE}',
      },
      required: [true, 'Leave type is required'],
    },
    dayType: {
      type: String,
      enum: {
        values: LEAVE_DAY_TYPE_VALUES,
        message: 'Invalid leave day type: {VALUE}',
      },
      default: LEAVE_DAY_TYPE.FULL_DAY,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: LEAVE_STATUS_VALUES,
        message: 'Invalid leave status: {VALUE}',
      },
      default: LEAVE_STATUS.PENDING,
      required: [true, 'Leave status is required'],
      index: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [250, 'Rejection reason cannot exceed 250 characters'],
      default: null,
    },
    cancelledAt: {
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
leaveSchema.index({ schoolId: 1, applicantUserId: 1, status: 1 });
leaveSchema.index({ schoolId: 1, studentId: 1, status: 1 });
leaveSchema.index({ schoolId: 1, teacherId: 1, status: 1 });
leaveSchema.index({ schoolId: 1, startDate: 1, endDate: 1 });

// Soft-delete query filter
leaveSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
