import mongoose from 'mongoose';
import { INVOICE_STATUS, INVOICE_STATUS_VALUES } from '../../constants/index.js';

const invoiceLineItemSchema = new mongoose.Schema(
  {
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
      default: null,
    },
    feeCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeCategory',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    fineAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const feeInvoiceSchema = new mongoose.Schema(
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
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Invoice title is required'],
      trim: true,
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      default: null,
    },
    year: {
      type: Number,
      default: null,
    },
    lineItems: {
      type: [invoiceLineItemSchema],
      required: true,
      validate: [(val) => val.length > 0, 'At least one line item is required'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalFine: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: {
        values: INVOICE_STATUS_VALUES,
        message: 'Invalid invoice status: {VALUE}',
      },
      default: INVOICE_STATUS.UNPAID,
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

feeInvoiceSchema.index(
  { schoolId: 1, invoiceNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

feeInvoiceSchema.index({ schoolId: 1, studentId: 1, status: 1 });
feeInvoiceSchema.index({ schoolId: 1, academicSessionId: 1, classId: 1, sectionId: 1 });

feeInvoiceSchema.pre(/^find/, function () {
  if (!this.getFilter().includeDeleted) {
    this.where({ isDeleted: false });
  }
});

const FeeInvoice = mongoose.model('FeeInvoice', feeInvoiceSchema);

export default FeeInvoice;
