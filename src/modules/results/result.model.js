import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
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
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Exam ID is required'],
      index: true,
    },
    examPaperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamPaper',
      required: [true, 'Exam Paper ID is required'],
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
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
      index: true,
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks obtained cannot be negative'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Max marks is required'],
      min: [1, 'Max marks must be at least 1'],
    },
    percentage: {
      type: Number,
      required: [true, 'Percentage is required'],
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      required: [true, 'Grade is required'],
      trim: true,
    },
    gradePoint: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
      default: '',
    },
    isLocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

// One mark record per student per exam paper
resultSchema.index(
  { schoolId: 1, examId: 1, examPaperId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

resultSchema.index({ schoolId: 1, examId: 1, sectionId: 1, isLocked: 1, isPublished: 1 });
resultSchema.index({ schoolId: 1, studentId: 1, examId: 1 });

resultSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Result = mongoose.model('Result', resultSchema);

export default Result;
