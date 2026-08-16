import mongoose from 'mongoose';
import {
  QUIZ_ATTEMPT_STATUS,
  QUIZ_ATTEMPT_STATUS_VALUES,
} from '../../constants/index.js';

const studentAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOptionIndex: { type: Number, default: null },
    textAnswer: { type: String, trim: true, default: null },
    isCorrect: { type: Boolean, default: null },
    marksAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    attemptNumber: {
      type: Number,
      required: [true, 'Attempt number is required'],
      min: [1, 'Attempt number must be at least 1'],
      default: 1,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: QUIZ_ATTEMPT_STATUS_VALUES,
        message: 'Invalid attempt status: {VALUE}',
      },
      default: QUIZ_ATTEMPT_STATUS.IN_PROGRESS,
      index: true,
    },
    answers: {
      type: [studentAnswerSchema],
      default: [],
    },
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
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

quizAttemptSchema.index(
  { schoolId: 1, quizId: 1, studentId: 1, attemptNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

quizAttemptSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
