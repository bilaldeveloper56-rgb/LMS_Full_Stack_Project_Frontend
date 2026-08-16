import mongoose from 'mongoose';
import { SUBJECT_TYPE, SUBJECT_TYPE_VALUES } from '../../constants/index.js';

const subjectSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      uppercase: true,
      maxlength: [50, 'Subject code cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    subjectType: {
      type: String,
      enum: {
        values: SUBJECT_TYPE_VALUES,
        message: 'Invalid subject type: {VALUE}',
      },
      default: SUBJECT_TYPE.CORE,
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
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
subjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });
subjectSchema.index({ schoolId: 1, name: 1 });
subjectSchema.index({ schoolId: 1, subjectType: 1 });
subjectSchema.index({ schoolId: 1, isActive: 1 });

// Soft-delete query filter
subjectSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
