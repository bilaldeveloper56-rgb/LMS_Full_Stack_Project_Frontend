import mongoose from 'mongoose';
import { DISCOUNT_TYPE, DISCOUNT_TYPE_VALUES } from '../../constants/index.js';

const feeConcessionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Concession name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    discountType: {
      type: String,
      enum: {
        values: DISCOUNT_TYPE_VALUES,
        message: 'Invalid discount type: {VALUE}',
      },
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
      default: '',
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

feeConcessionSchema.index(
  { schoolId: 1, name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

feeConcessionSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const FeeConcession = mongoose.model('FeeConcession', feeConcessionSchema);

export default FeeConcession;
