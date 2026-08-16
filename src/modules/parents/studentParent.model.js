import mongoose from 'mongoose';
import { RELATIONSHIP_TYPE, RELATIONSHIP_TYPE_VALUES } from '../../constants/index.js';

const studentParentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parent',
      required: [true, 'Parent ID is required'],
      index: true,
    },
    relationshipType: {
      type: String,
      enum: {
        values: RELATIONSHIP_TYPE_VALUES,
        message: 'Invalid relationship type: {VALUE}',
      },
      default: RELATIONSHIP_TYPE.GUARDIAN,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    canReceiveNotifications: {
      type: Boolean,
      default: true,
    },
    canViewAcademicRecords: {
      type: Boolean,
      default: true,
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
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Unique compound index: a student and parent can only be linked once per school
studentParentSchema.index(
  { schoolId: 1, studentId: 1, parentId: 1 },
  { unique: true }
);

studentParentSchema.index({ schoolId: 1, parentId: 1 });
studentParentSchema.index({ schoolId: 1, studentId: 1 });

const StudentParent = mongoose.model('StudentParent', studentParentSchema);
export default StudentParent;
