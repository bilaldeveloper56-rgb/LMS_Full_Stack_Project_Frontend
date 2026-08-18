import mongoose from 'mongoose';
import {
  FEE_FREQUENCY,
  FEE_FREQUENCY_VALUES,
  LATE_FEE_TYPE,
  LATE_FEE_TYPE_VALUES,
} from '../../constants/index.js';

const feeStructureSchema = new mongoose.Schema(
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
    feeCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeCategory',
      required: [true, 'Fee Category ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Fee structure name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'PKR',
      trim: true,
      uppercase: true,
    },
    frequency: {
      type: String,
      enum: {
        values: FEE_FREQUENCY_VALUES,
        message: 'Invalid frequency: {VALUE}',
      },
      default: FEE_FREQUENCY.MONTHLY,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    lateFeeType: {
      type: String,
      enum: {
        values: LATE_FEE_TYPE_VALUES,
        message: 'Invalid late fee type: {VALUE}',
      },
      default: LATE_FEE_TYPE.NONE,
    },
    lateFeeAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    lateFeeGraceDays: {
      type: Number,
      min: 0,
      default: 0,
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

feeStructureSchema.index(
  { schoolId: 1, academicSessionId: 1, classId: 1, feeCategoryId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

feeStructureSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

export default FeeStructure;
