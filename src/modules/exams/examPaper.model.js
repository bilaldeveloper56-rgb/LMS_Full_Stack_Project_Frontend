import mongoose from 'mongoose';
import { EXAM_STATUS, EXAM_STATUS_VALUES } from '../../constants/index.js';

const examPaperSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'],
      trim: true,
    },
    room: {
      type: String,
      trim: true,
      maxlength: [50, 'Room cannot exceed 50 characters'],
      default: null,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [1, 'Total marks must be at least 1'],
      default: 100,
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks is required'],
      min: [0, 'Passing marks cannot be negative'],
      default: 40,
    },
    invigilatorTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: EXAM_STATUS_VALUES,
        message: 'Invalid exam paper status: {VALUE}',
      },
      default: EXAM_STATUS.SCHEDULED,
      index: true,
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

examPaperSchema.index(
  { schoolId: 1, examId: 1, classId: 1, subjectId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

examPaperSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const ExamPaper = mongoose.model('ExamPaper', examPaperSchema);

export default ExamPaper;
