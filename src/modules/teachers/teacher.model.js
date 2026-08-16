import mongoose from 'mongoose';
import { EMPLOYMENT_STATUS, EMPLOYMENT_STATUS_VALUES, GENDER, GENDER_VALUES } from '../../constants/index.js';

const teacherSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
      uppercase: true,
      maxlength: [50, 'Employee ID cannot exceed 50 characters'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: {
        values: GENDER_VALUES,
        message: 'Invalid gender: {VALUE}',
      },
      default: GENDER.OTHER,
    },
    qualification: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, 'Qualification cannot exceed 100 characters'],
    },
    specialization: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, 'Specialization cannot exceed 100 characters'],
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    designation: {
      type: String,
      trim: true,
      default: 'Teacher',
      maxlength: [50, 'Designation cannot exceed 50 characters'],
    },
    profileImage: {
      type: String,
      default: null,
    },
    employmentStatus: {
      type: String,
      enum: {
        values: EMPLOYMENT_STATUS_VALUES,
        message: 'Invalid employment status: {VALUE}',
      },
      default: EMPLOYMENT_STATUS.ACTIVE,
    },
    userId: {
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
teacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
teacherSchema.index({ schoolId: 1, email: 1 });
teacherSchema.index({ schoolId: 1, employmentStatus: 1 });
teacherSchema.index({ schoolId: 1, userId: 1 });

// Soft-delete query filter
teacherSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
