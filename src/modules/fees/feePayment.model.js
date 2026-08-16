import mongoose from 'mongoose';
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
} from '../../constants/index.js';

const feePaymentSchema = new mongoose.Schema(
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
      required: [true, 'Academic session ID is required'],
      index: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeInvoice',
      required: [true, 'Invoice ID is required'],
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      trim: true,
    },
    amountPaid: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be greater than 0'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHOD_VALUES,
        message: 'Invalid payment method: {VALUE}',
      },
      default: PAYMENT_METHOD.CASH,
    },
    transactionReference: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, 'Remarks cannot exceed 500 characters'],
      default: '',
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Received by user ID is required'],
    },
    status: {
      type: String,
      enum: {
        values: PAYMENT_STATUS_VALUES,
        message: 'Invalid payment status: {VALUE}',
      },
      default: PAYMENT_STATUS.SUCCESS,
      index: true,
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

feePaymentSchema.index(
  { schoolId: 1, receiptNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

feePaymentSchema.index({ schoolId: 1, invoiceId: 1 });
feePaymentSchema.index({ schoolId: 1, studentId: 1 });

feePaymentSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const FeePayment = mongoose.model('FeePayment', feePaymentSchema);

export default FeePayment;
