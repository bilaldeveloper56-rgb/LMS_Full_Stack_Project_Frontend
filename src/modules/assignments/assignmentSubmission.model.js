import mongoose from 'mongoose';
import { SUBMISSION_STATUS, SUBMISSION_STATUS_VALUES } from '../../constants/index.js';

const submissionAttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    fileType: { type: String, trim: true, default: 'application/octet-stream' },
  },
  { _id: false }
);

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    submissionContent: {
      type: String,
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
      default: '',
    },
    attachments: {
      type: [submissionAttachmentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: SUBMISSION_STATUS_VALUES,
        message: 'Invalid submission status: {VALUE}',
      },
      default: SUBMISSION_STATUS.SUBMITTED,
      index: true,
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
      default: null,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    gradedAt: {
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

// One active submission per student per assignment
assignmentSubmissionSchema.index(
  { schoolId: 1, assignmentId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

assignmentSubmissionSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

export default AssignmentSubmission;
