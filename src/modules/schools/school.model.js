import mongoose from 'mongoose';
import { SCHOOL_STATUS, SCHOOL_STATUS_VALUES } from '../../constants/index.js';

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      maxlength: [100, 'School name cannot exceed 100 characters'],
    },
    schoolCode: {
      type: String,
      required: [true, 'School code is required'],
      uppercase: true,
      trim: true,
      minlength: [2, 'School code must be at least 2 characters'],
      maxlength: [20, 'School code cannot exceed 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'School email is required'],
      lowercase: true,
      trim: true,
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
    },
    city: {
      type: String,
      trim: true,
      default: null,
    },
    province: {
      type: String,
      trim: true,
      default: null,
    },
    country: {
      type: String,
      trim: true,
      default: 'US',
    },
    logo: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    registrationNumber: {
      type: String,
      default: null,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    currency: {
      type: String,
      default: 'PKR',
      trim: true,
      uppercase: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    status: {
      type: String,
      enum: {
        values: SCHOOL_STATUS_VALUES,
        message: 'Invalid school status: {VALUE}',
      },
      default: SCHOOL_STATUS.ACTIVE,
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
      select: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.deletedBy;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// --- Indexes (Partial Unique: Uniqueness applies only to active/non-deleted schools) ---
schoolSchema.index(
  { schoolCode: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
schoolSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
schoolSchema.index({ status: 1 });
schoolSchema.index({ createdAt: -1 });

// --- Soft deletion filter for queries and counts ---
schoolSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

schoolSchema.pre('countDocuments', function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

const School = mongoose.model('School', schoolSchema);
export default School;
