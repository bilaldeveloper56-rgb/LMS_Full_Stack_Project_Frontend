import { z } from 'zod';

export const FEE_FREQUENCIES = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'TERMLY', label: 'Termly' },
  { value: 'ANNUALLY', label: 'Annually' },
  { value: 'ONE_TIME', label: 'One Time (Admission/Registration)' },
];

export const DISCOUNT_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage (%)' },
  { value: 'FLAT', label: 'Flat Amount (Fixed)' },
];

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'ONLINE', label: 'Online / Card' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
];

export const createFeeCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
  description: z.string().trim().max(500).optional().default(''),
});

export const createFeeStructureSchema = z.object({
  academicSessionId: z.string().min(1, 'Academic session is required'),
  classId: z.string().min(1, 'Class is required'),
  feeCategoryId: z.string().min(1, 'Fee category is required'),
  name: z.string().trim().min(1, 'Structure name is required').max(100),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  frequency: z.enum(['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'TERMLY', 'ANNUALLY']).default('MONTHLY'),
});

export const createFeeConcessionSchema = z.object({
  name: z.string().trim().min(1, 'Concession name is required').max(100),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.coerce.number().min(0, 'Discount value cannot be negative'),
  reason: z.string().trim().max(500).optional().default(''),
});

export const generateInvoiceSchema = z.object({
  academicSessionId: z.string().min(1, 'Academic session is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().optional().default(''),
  studentId: z.string().optional().default(''),
  feeStructureIds: z.array(z.string()).min(1, 'Please select at least one fee structure'),
  concessionId: z.string().optional().default(''),
  title: z.string().trim().min(1, 'Challan / Invoice title is required').max(150),
  dueDate: z.string().min(1, 'Due date is required'),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amountPaid: z.coerce.number().min(1, 'Payment amount must be at least 1'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'ONLINE', 'CHEQUE', 'OTHER']).default('CASH'),
  transactionReference: z.string().trim().max(100).optional().default(''),
  remarks: z.string().trim().max(500).optional().default(''),
});
