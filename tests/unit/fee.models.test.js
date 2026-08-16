import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import FeeCategory from '../../src/modules/fees/feeCategory.model.js';
import FeeStructure from '../../src/modules/fees/feeStructure.model.js';
import FeeConcession from '../../src/modules/fees/feeConcession.model.js';
import FeeInvoice from '../../src/modules/fees/feeInvoice.model.js';
import FeePayment from '../../src/modules/fees/feePayment.model.js';
import {
  FEE_FREQUENCY,
  LATE_FEE_TYPE,
  DISCOUNT_TYPE,
  INVOICE_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from '../../src/constants/index.js';

describe('Phase 8 Fee Models Unit Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439022';
  const classId = '507f1f77bcf86cd799439033';
  const sectionId = '507f1f77bcf86cd799439044';
  const studentId = '507f1f77bcf86cd799439055';
  const categoryId = '507f1f77bcf86cd799439066';
  const userId = '507f1f77bcf86cd799439077';

  describe('FeeCategory Model', () => {
    it('should instantiate fee category with valid fields and defaults', () => {
      const cat = new FeeCategory({
        schoolId,
        name: 'Tuition Fee',
        description: 'Standard monthly academic tuition fee',
      });

      assert.equal(cat.name, 'Tuition Fee');
      assert.equal(cat.description, 'Standard monthly academic tuition fee');
      assert.equal(cat.isDeleted, false);
    });

    it('should strip isDeleted and __v in toJSON', () => {
      const cat = new FeeCategory({
        schoolId,
        name: 'Lab Charges',
      });
      const json = cat.toJSON();
      assert.equal(json.isDeleted, undefined);
      assert.equal(json.__v, undefined);
    });
  });

  describe('FeeStructure Model', () => {
    it('should instantiate fee structure with defaults', () => {
      const structure = new FeeStructure({
        schoolId,
        academicSessionId: sessionId,
        classId,
        feeCategoryId: categoryId,
        name: 'Grade 10 Tuition Fee',
        amount: 2500,
        frequency: FEE_FREQUENCY.MONTHLY,
      });

      assert.equal(structure.name, 'Grade 10 Tuition Fee');
      assert.equal(structure.amount, 2500);
      assert.equal(structure.frequency, FEE_FREQUENCY.MONTHLY);
      assert.equal(structure.lateFeeType, LATE_FEE_TYPE.NONE);
      assert.equal(structure.lateFeeAmount, 0);
    });

    it('should reject invalid late fee type', () => {
      const structure = new FeeStructure({
        schoolId,
        academicSessionId: sessionId,
        classId,
        feeCategoryId: categoryId,
        name: 'Invalid Fee Structure',
        amount: 1000,
        lateFeeType: 'INVALID_LATE_FEE_TYPE',
      });
      const err = structure.validateSync();
      assert.ok(err && err.errors.lateFeeType);
    });
  });

  describe('FeeConcession Model', () => {
    it('should instantiate fee concession with percentage discount', () => {
      const concession = new FeeConcession({
        schoolId,
        name: 'Merit Scholarship',
        discountType: DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 20,
        reason: 'Top 5 rank in previous session',
      });

      assert.equal(concession.discountType, DISCOUNT_TYPE.PERCENTAGE);
      assert.equal(concession.discountValue, 20);
      assert.equal(concession.isDeleted, false);
    });
  });

  describe('FeeInvoice Model', () => {
    it('should instantiate fee invoice with line items and balance', () => {
      const invoice = new FeeInvoice({
        schoolId,
        academicSessionId: sessionId,
        studentId,
        classId,
        sectionId,
        invoiceNumber: 'INV-2026-00001',
        title: 'Q1 Tuition & Lab Invoice',
        lineItems: [
          {
            feeCategoryId: categoryId,
            name: 'Tuition Fee',
            baseAmount: 3000,
            discountAmount: 300,
            fineAmount: 0,
            netAmount: 2700,
          },
        ],
        subtotal: 3000,
        totalDiscount: 300,
        totalFine: 0,
        totalAmount: 2700,
        paidAmount: 0,
        balanceAmount: 2700,
        dueDate: new Date('2026-10-15'),
        status: INVOICE_STATUS.UNPAID,
      });

      assert.equal(invoice.invoiceNumber, 'INV-2026-00001');
      assert.equal(invoice.totalAmount, 2700);
      assert.equal(invoice.balanceAmount, 2700);
      assert.equal(invoice.status, INVOICE_STATUS.UNPAID);
    });

    it('should reject invalid invoice status', () => {
      const invoice = new FeeInvoice({
        schoolId,
        academicSessionId: sessionId,
        studentId,
        classId,
        sectionId,
        invoiceNumber: 'INV-2026-00002',
        title: 'Invalid Status Invoice',
        lineItems: [{ feeCategoryId: categoryId, name: 'Fee', baseAmount: 100, netAmount: 100 }],
        subtotal: 100,
        totalAmount: 100,
        balanceAmount: 100,
        dueDate: new Date(),
        status: 'UNKNOWN_STATUS',
      });
      const err = invoice.validateSync();
      assert.ok(err && err.errors.status);
    });
  });

  describe('FeePayment Model', () => {
    it('should instantiate fee payment receipt with defaults', () => {
      const payment = new FeePayment({
        schoolId,
        academicSessionId: sessionId,
        invoiceId: '507f1f77bcf86cd799439088',
        studentId,
        receiptNumber: 'REC-2026-00001',
        amountPaid: 1500,
        paymentMethod: PAYMENT_METHOD.BANK_TRANSFER,
        transactionReference: 'TXN-987654321',
        receivedBy: userId,
        status: PAYMENT_STATUS.SUCCESS,
      });

      assert.equal(payment.receiptNumber, 'REC-2026-00001');
      assert.equal(payment.amountPaid, 1500);
      assert.equal(payment.paymentMethod, PAYMENT_METHOD.BANK_TRANSFER);
      assert.equal(payment.status, PAYMENT_STATUS.SUCCESS);
    });

    it('should reject payment with amount <= 0', () => {
      const payment = new FeePayment({
        schoolId,
        academicSessionId: sessionId,
        invoiceId: '507f1f77bcf86cd799439088',
        studentId,
        receiptNumber: 'REC-2026-00002',
        amountPaid: 0,
        receivedBy: userId,
      });
      const err = payment.validateSync();
      assert.ok(err && err.errors.amountPaid);
    });

    it('should strip isDeleted and __v in FeePayment toJSON', () => {
      const payment = new FeePayment({
        schoolId,
        academicSessionId: sessionId,
        invoiceId: '507f1f77bcf86cd799439088',
        studentId,
        receiptNumber: 'REC-2026-00003',
        amountPaid: 500,
        receivedBy: userId,
      });
      const json = payment.toJSON();
      assert.equal(json.isDeleted, undefined);
      assert.equal(json.__v, undefined);
    });
  });
});
