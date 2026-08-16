import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFeeCategorySchema,
  createFeeStructureSchema,
  createFeeConcessionSchema,
  generateInvoiceSchema,
  recordPaymentSchema,
  queryInvoiceSchema,
  queryPaymentSchema,
} from '../../src/modules/fees/fee.validator.js';

describe('Phase 8 Fee Validators Unit Tests', () => {
  const validObjectId = '507f1f77bcf86cd799439011';

  describe('createFeeCategorySchema', () => {
    it('should validate valid fee category payload', () => {
      const parsed = createFeeCategorySchema.parse({
        name: 'Transport Fee',
        description: 'Zone A bus route',
      });
      assert.equal(parsed.name, 'Transport Fee');
    });

    it('should reject missing category name', () => {
      assert.throws(() => {
        createFeeCategorySchema.parse({});
      });
    });
  });

  describe('createFeeStructureSchema', () => {
    it('should validate valid fee structure payload', () => {
      const parsed = createFeeStructureSchema.parse({
        academicSessionId: validObjectId,
        classId: validObjectId,
        feeCategoryId: validObjectId,
        name: 'Tuition Fee 2026',
        amount: '2000',
        frequency: 'MONTHLY',
        lateFeeType: 'FLAT',
        lateFeeAmount: 100,
      });
      assert.equal(parsed.amount, 2000);
      assert.equal(parsed.lateFeeType, 'FLAT');
    });

    it('should reject invalid objectId in structure', () => {
      assert.throws(() => {
        createFeeStructureSchema.parse({
          academicSessionId: 'invalid-id',
          classId: validObjectId,
          feeCategoryId: validObjectId,
          name: 'Fee',
          amount: 500,
        });
      });
    });
  });

  describe('createFeeConcessionSchema', () => {
    it('should validate valid concession schema', () => {
      const parsed = createFeeConcessionSchema.parse({
        name: 'Sibling Concession',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        reason: 'Second child enrolled',
      });
      assert.equal(parsed.discountValue, 15);
    });

    it('should reject negative discount value', () => {
      assert.throws(() => {
        createFeeConcessionSchema.parse({
          name: 'Invalid Discount',
          discountType: 'FLAT',
          discountValue: -50,
        });
      });
    });
  });

  describe('generateInvoiceSchema', () => {
    it('should validate single/bulk invoice generation schema', () => {
      const parsed = generateInvoiceSchema.parse({
        academicSessionId: validObjectId,
        classId: validObjectId,
        feeStructureIds: [validObjectId],
        title: 'Term 1 Fee Challan',
        dueDate: '2026-11-15T00:00:00Z',
      });
      assert.equal(parsed.title, 'Term 1 Fee Challan');
      assert.equal(parsed.feeStructureIds.length, 1);
    });

    it('should reject invoice generation without fee structures', () => {
      assert.throws(() => {
        generateInvoiceSchema.parse({
          academicSessionId: validObjectId,
          classId: validObjectId,
          feeStructureIds: [],
          title: 'Fee',
          dueDate: '2026-11-15',
        });
      });
    });
  });

  describe('recordPaymentSchema', () => {
    it('should validate payment recording payload', () => {
      const parsed = recordPaymentSchema.parse({
        invoiceId: validObjectId,
        amountPaid: '1200',
        paymentMethod: 'UPI',
        transactionReference: 'UPI-123456',
      });
      assert.equal(parsed.amountPaid, 1200);
      assert.equal(parsed.paymentMethod, 'UPI');
    });

    it('should reject payment amount less than 1', () => {
      assert.throws(() => {
        recordPaymentSchema.parse({
          invoiceId: validObjectId,
          amountPaid: 0,
        });
      });
    });
  });

  describe('queryInvoiceSchema', () => {
    it('should validate query filters with default pagination', () => {
      const parsed = queryInvoiceSchema.parse({
        status: 'UNPAID',
        classId: validObjectId,
      });
      assert.equal(parsed.status, 'UNPAID');
      assert.equal(parsed.page, 1);
      assert.equal(parsed.limit, 20);
    });

    it('should coerce string page and limit parameters', () => {
      const parsed = queryInvoiceSchema.parse({
        page: '2',
        limit: '50',
      });
      assert.equal(parsed.page, 2);
      assert.equal(parsed.limit, 50);
    });
  });

  describe('queryPaymentSchema', () => {
    it('should validate query payment filters', () => {
      const parsed = queryPaymentSchema.parse({
        paymentMethod: 'ONLINE',
        studentId: validObjectId,
      });
      assert.equal(parsed.paymentMethod, 'ONLINE');
      assert.equal(parsed.page, 1);
    });
  });
});
