import { z } from 'zod';
import {
  FEE_FREQUENCY_VALUES,
  LATE_FEE_TYPE_VALUES,
  DISCOUNT_TYPE_VALUES,
  PAYMENT_METHOD_VALUES,
  INVOICE_STATUS_VALUES,
} from '../../constants/index.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z.string().regex(objectIdRegex, 'Invalid ObjectId format');

export const createFeeCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
  description: z.string().trim().max(500).optional().default(''),
});

export const createFeeStructureSchema = z.object({
  academicSessionId: objectIdSchema,
  classId: objectIdSchema,
  feeCategoryId: objectIdSchema,
  name: z.string().trim().min(1, 'Name is required').max(100),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  frequency: z.enum(FEE_FREQUENCY_VALUES).optional().default('MONTHLY'),
  dueDate: z.string().datetime().optional().or(z.string().date()).optional(),
  lateFeeType: z.enum(LATE_FEE_TYPE_VALUES).optional().default('NONE'),
  lateFeeAmount: z.coerce.number().min(0).optional().default(0),
  lateFeeGraceDays: z.coerce.number().int().min(0).optional().default(0),
});

export const createFeeConcessionSchema = z.object({
  name: z.string().trim().min(1, 'Concession name is required').max(100),
  discountType: z.enum(DISCOUNT_TYPE_VALUES),
  discountValue: z.coerce.number().min(0, 'Discount value cannot be negative'),
  reason: z.string().trim().max(500).optional().default(''),
});

export const generateInvoiceSchema = z.object({
  academicSessionId: objectIdSchema,
  classId: objectIdSchema,
  sectionId: objectIdSchema.optional(),
  studentId: objectIdSchema.optional(), // If provided, generates for single student
  feeStructureIds: z.array(objectIdSchema).min(1, 'At least one fee structure is required'),
  concessionId: objectIdSchema.optional(),
  title: z.string().trim().min(1, 'Invoice title is required').max(150),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  dueDate: z.string().datetime().or(z.string().date()),
});

export const recordPaymentSchema = z.object({
  invoiceId: objectIdSchema,
  amountPaid: z.coerce.number().min(1, 'Payment amount must be at least 1'),
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES).optional().default('CASH'),
  transactionReference: z.string().trim().max(100).optional().default(''),
  remarks: z.string().trim().max(500).optional().default(''),
});

export const queryInvoiceSchema = z.object({
  academicSessionId: objectIdSchema.optional(),
  classId: objectIdSchema.optional(),
  sectionId: objectIdSchema.optional(),
  studentId: objectIdSchema.optional(),
  status: z.enum(INVOICE_STATUS_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const queryPaymentSchema = z.object({
  invoiceId: objectIdSchema.optional(),
  studentId: objectIdSchema.optional(),
  paymentMethod: z.enum(PAYMENT_METHOD_VALUES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
