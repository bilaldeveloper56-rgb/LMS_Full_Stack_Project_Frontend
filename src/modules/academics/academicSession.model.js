import mongoose from 'mongoose';
import { SESSION_STATUS, SESSION_STATUS_VALUES } from '../../constants/index.js';

const academicSessionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Session name is required'],
      trim: true,
      maxlength: [100, 'Session name cannot exceed 100 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: {
        values: SESSION_STATUS_VALUES,
        message: 'Invalid session status: {VALUE}',
      },
      default: SESSION_STATUS.UPCOMING,
    },
    isCurrent: {
      type: Boolean,
      default: false,
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
academicSessionSchema.index({ schoolId: 1, name: 1 });
academicSessionSchema.index({ schoolId: 1, isCurrent: 1 });
academicSessionSchema.index({ schoolId: 1, status: 1 });
academicSessionSchema.index({ schoolId: 1, startDate: 1, endDate: 1 });

// Soft-delete query filter
academicSessionSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const AcademicSession = mongoose.model('AcademicSession', academicSessionSchema);
export default AcademicSession;
