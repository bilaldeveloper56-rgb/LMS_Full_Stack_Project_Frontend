import mongoose from 'mongoose';
import { ASSIGNMENT_STATUS, ASSIGNMENT_STATUS_VALUES } from '../../constants/index.js';

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    fileType: { type: String, trim: true, default: 'application/octet-stream' },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
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
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum score is required'],
      min: [1, 'Maximum score must be at least 1'],
      default: 100,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ASSIGNMENT_STATUS_VALUES,
        message: 'Invalid assignment status: {VALUE}',
      },
      default: ASSIGNMENT_STATUS.DRAFT,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    allowLateSubmission: {
      type: Boolean,
      default: true,
    },
    lateSubmissionPenaltyPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Penalty percentage cannot be negative'],
      max: [100, 'Penalty percentage cannot exceed 100'],
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

assignmentSchema.index({ schoolId: 1, classId: 1, sectionId: 1, status: 1 });
assignmentSchema.index({ schoolId: 1, teacherId: 1, status: 1 });

assignmentSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
