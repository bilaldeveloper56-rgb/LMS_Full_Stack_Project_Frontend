import mongoose from 'mongoose';
import {
  ENROLLMENT_STATUS,
  ENROLLMENT_STATUS_VALUES,
  GENDER,
  GENDER_VALUES,
  BLOOD_GROUP_VALUES,
} from '../../constants/index.js';

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      trim: true,
      uppercase: true,
      maxlength: [50, 'Admission number cannot exceed 50 characters'],
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
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: {
        values: GENDER_VALUES,
        message: 'Invalid gender: {VALUE}',
      },
      default: GENDER.OTHER,
    },
    profileImage: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: null,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: [true, 'Academic session ID is required'],
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
    rollNumber: {
      type: String,
      trim: true,
      default: null,
      maxlength: [50, 'Roll number cannot exceed 50 characters'],
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    enrollmentStatus: {
      type: String,
      enum: {
        values: ENROLLMENT_STATUS_VALUES,
        message: 'Invalid enrollment status: {VALUE}',
      },
      default: ENROLLMENT_STATUS.ACTIVE,
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BLOOD_GROUP_VALUES,
        message: 'Invalid blood group: {VALUE}',
      },
      default: null,
    },
    emergencyContactName: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
      default: null,
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
studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, academicSessionId: 1, classId: 1, sectionId: 1 });
studentSchema.index({ schoolId: 1, enrollmentStatus: 1 });
studentSchema.index({ schoolId: 1, userId: 1 });

// Soft-delete query filter
studentSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
