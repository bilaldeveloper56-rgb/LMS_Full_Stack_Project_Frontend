import mongoose from 'mongoose';
import { DAY_OF_WEEK_VALUES } from '../../constants/index.js';

const timetableSchema = new mongoose.Schema(
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
    dayOfWeek: {
      type: String,
      enum: {
        values: DAY_OF_WEEK_VALUES,
        message: 'Invalid day of week: {VALUE}',
      },
      required: [true, 'Day of week is required'],
    },
    periodNumber: {
      type: Number,
      required: [true, 'Period number is required'],
      min: [1, 'Period number must be at least 1'],
      max: [12, 'Period number cannot exceed 12'],
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
    isActive: {
      type: Boolean,
      default: true,
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

// 1. Section collision index: Section cannot have two classes at same day & period
timetableSchema.index(
  { schoolId: 1, academicSessionId: 1, sectionId: 1, dayOfWeek: 1, periodNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// 2. Teacher collision index: Teacher cannot teach two sections at same day & period
timetableSchema.index(
  { schoolId: 1, academicSessionId: 1, teacherId: 1, dayOfWeek: 1, periodNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Soft delete query filter
timetableSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
