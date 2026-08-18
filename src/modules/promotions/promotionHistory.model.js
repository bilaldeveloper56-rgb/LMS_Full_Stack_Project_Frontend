import mongoose from 'mongoose';
import { PROMOTION_STATUS, PROMOTION_STATUS_VALUES } from '../../constants/index.js';

const promotionHistorySchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    batchId: {
      type: String,
      required: [true, 'Promotion Batch ID is required'],
      index: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    fromAcademicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: [true, 'Source academic session is required'],
      index: true,
    },
    toAcademicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: [true, 'Destination academic session is required'],
      index: true,
    },
    fromClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Source class is required'],
    },
    toClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Destination class is required'],
    },
    fromSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Source section is required'],
    },
    toSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Destination section is required'],
    },
    promotionStatus: {
      type: String,
      enum: {
        values: PROMOTION_STATUS_VALUES,
        message: 'Invalid promotion status: {VALUE}',
      },
      default: PROMOTION_STATUS.PROMOTED,
      required: true,
      index: true,
    },
    previousRollNumber: {
      type: String,
      trim: true,
      default: null,
    },
    newRollNumber: {
      type: String,
      trim: true,
      default: null,
    },
    reason: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performing user is required'],
    },
    performedAt: {
      type: Date,
      default: Date.now,
      index: true,
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

// Compound indexes for history queries and reporting
promotionHistorySchema.index({ schoolId: 1, studentId: 1, performedAt: -1 });
promotionHistorySchema.index({ schoolId: 1, toAcademicSessionId: 1, toClassId: 1, toSectionId: 1 });
promotionHistorySchema.index({ schoolId: 1, batchId: 1 });

const PromotionHistory = mongoose.model('PromotionHistory', promotionHistorySchema);
export default PromotionHistory;
