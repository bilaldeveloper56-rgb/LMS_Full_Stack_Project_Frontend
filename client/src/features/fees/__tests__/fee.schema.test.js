import { describe, it, expect } from 'vitest';
import {
  createFeeCategorySchema,
  createFeeStructureSchema,
  createFeeConcessionSchema,
  generateInvoiceSchema,
  recordPaymentSchema,
} from '../schemas/fee.schema';

describe('Fees Zod Schemas', () => {
  it('should validate createFeeCategorySchema', () => {
    expect(createFeeCategorySchema.safeParse({ name: 'Tuition' }).success).toBe(true);
    expect(createFeeCategorySchema.safeParse({ name: '' }).success).toBe(false);
  });

  it('should validate createFeeStructureSchema', () => {
    const valid = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439022',
      feeCategoryId: '507f1f77bcf86cd799439033',
      name: 'Class 10 Monthly Fee',
      amount: 250,
      frequency: 'MONTHLY',
    };
    expect(createFeeStructureSchema.safeParse(valid).success).toBe(true);
    expect(createFeeStructureSchema.safeParse({ ...valid, amount: -10 }).success).toBe(false);
  });

  it('should validate createFeeConcessionSchema', () => {
    const valid = {
      name: 'Sibling Scholarship',
      discountType: 'PERCENTAGE',
      discountValue: 15,
    };
    expect(createFeeConcessionSchema.safeParse(valid).success).toBe(true);
  });

  it('should validate generateInvoiceSchema and recordPaymentSchema', () => {
    const validInvoice = {
      academicSessionId: '507f1f77bcf86cd799439011',
      classId: '507f1f77bcf86cd799439022',
      feeStructureIds: ['507f1f77bcf86cd799439033'],
      title: 'Term 1 Fee',
      dueDate: '2026-10-31',
    };
    expect(generateInvoiceSchema.safeParse(validInvoice).success).toBe(true);

    const emptyStructures = {
      ...validInvoice,
      feeStructureIds: [],
    };
    expect(generateInvoiceSchema.safeParse(emptyStructures).success).toBe(false);

    const validPayment = {
      invoiceId: '507f1f77bcf86cd799439044',
      amountPaid: 250,
      paymentMethod: 'CASH',
    };
    expect(recordPaymentSchema.safeParse(validPayment).success).toBe(true);
    expect(recordPaymentSchema.safeParse({ ...validPayment, amountPaid: 0 }).success).toBe(false);
  });
});
