import mongoose from 'mongoose';
import {
  EXAM_TYPE,
  EXAM_TYPE_VALUES,
  EXAM_STATUS,
  EXAM_STATUS_VALUES,
} from '../../constants/index.js';

const examSchema = new mongoose.Schema(
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
      required: [true, 'Academic Session ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
      maxlength: [150, 'Exam name cannot exceed 150 characters'],
    },
    examType: {
      type: String,
      enum: {
        values: EXAM_TYPE_VALUES,
        message: 'Invalid exam type: {VALUE}',
      },
      required: [true, 'Exam type is required'],
      default: EXAM_TYPE.MID_TERM,
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
        values: EXAM_STATUS_VALUES,
        message: 'Invalid exam status: {VALUE}',
      },
      default: EXAM_STATUS.SCHEDULED,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        return ret;
      },
    },
  }
);

examSchema.index(
  { schoolId: 1, academicSessionId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

examSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
