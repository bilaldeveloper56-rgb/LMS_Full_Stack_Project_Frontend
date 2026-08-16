import mongoose from 'mongoose';
import {
  QUIZ_STATUS,
  QUIZ_STATUS_VALUES,
  QUESTION_TYPE,
  QUESTION_TYPE_VALUES,
} from '../../constants/index.js';

const optionSchema = new mongoose.Schema(
  {
    optionText: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [2000, 'Question text cannot exceed 2000 characters'],
    },
    questionType: {
      type: String,
      enum: {
        values: QUESTION_TYPE_VALUES,
        message: 'Invalid question type: {VALUE}',
      },
      required: [true, 'Question type is required'],
    },
    marks: {
      type: Number,
      required: [true, 'Question marks is required'],
      min: [1, 'Marks must be at least 1'],
    },
    options: {
      type: [optionSchema],
      default: [],
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
      default: null,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
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
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Instructions cannot exceed 2000 characters'],
      default: '',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [300, 'Duration cannot exceed 300 minutes'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [1, 'Total marks must be at least 1'],
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks is required'],
      min: [0, 'Passing marks cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: QUIZ_STATUS_VALUES,
        message: 'Invalid quiz status: {VALUE}',
      },
      default: QUIZ_STATUS.DRAFT,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: [1, 'Max attempts must be at least 1'],
      max: [10, 'Max attempts cannot exceed 10'],
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    questions: {
      type: [questionSchema],
      default: [],
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

quizSchema.index({ schoolId: 1, classId: 1, sectionId: 1, status: 1 });
quizSchema.index({ schoolId: 1, teacherId: 1, status: 1 });

quizSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
