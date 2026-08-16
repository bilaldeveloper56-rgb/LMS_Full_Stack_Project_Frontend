import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import FeeCategory from '../../src/modules/fees/feeCategory.model.js';
import FeeStructure from '../../src/modules/fees/feeStructure.model.js';
import FeeConcession from '../../src/modules/fees/feeConcession.model.js';
import FeeInvoice from '../../src/modules/fees/feeInvoice.model.js';
import FeePayment from '../../src/modules/fees/feePayment.model.js';
import School from '../../src/modules/schools/school.model.js';
import AcademicSession from '../../src/modules/academics/academicSession.model.js';
import Class from '../../src/modules/academics/class.model.js';
import Section from '../../src/modules/academics/section.model.js';
import Student from '../../src/modules/students/student.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import * as feeService from '../../src/modules/fees/fee.service.js';
import { ROLES, INVOICE_STATUS } from '../../src/constants/index.js';

describe('Fee Service Integration Tests', () => {
  const schoolId = '507f1f77bcf86cd799439011';
  const sessionId = '507f1f77bcf86cd799439022';
  const classId = '507f1f77bcf86cd799439033';
  const sectionId = '507f1f77bcf86cd799439044';
  const studentId = '507f1f77bcf86cd799439055';
  const categoryId = '507f1f77bcf86cd799439066';
  const structureId = '507f1f77bcf86cd799439077';
  const concessionId = '507f1f77bcf86cd799439088';
  const invoiceId = '507f1f77bcf86cd799439099';

  const adminUser = { id: 'admin-1', role: ROLES.SCHOOL_ADMIN, schoolId };
  const studentUser = { id: 'student-user-1', role: ROLES.STUDENT, schoolId };
  const parentUser = { id: 'parent-user-1', role: ROLES.PARENT, schoolId };

  it('should create fee category successfully', async () => {
    const origSchoolFindById = School.findById;
    const origCategorySave = FeeCategory.prototype.save;

    School.findById = () => Promise.resolve({ _id: schoolId, isDeleted: false });
    FeeCategory.prototype.save = function () {
      this._id = categoryId;
      return Promise.resolve(this);
    };

    const category = await feeService.createFeeCategory(
      { name: 'Tuition Fee', description: 'Monthly tuition' },
      adminUser
    );

    School.findById = origSchoolFindById;
    FeeCategory.prototype.save = origCategorySave;

    assert.equal(category.name, 'Tuition Fee');
  });

  it('should create fee structure linked to class and category', async () => {
    const origSessionFindOne = AcademicSession.findOne;
    const origClassFindOne = Class.findOne;
    const origCategoryFindOne = FeeCategory.findOne;
    const origStructureSave = FeeStructure.prototype.save;

    AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    FeeCategory.findOne = () => Promise.resolve({ _id: categoryId, schoolId });
    FeeStructure.prototype.save = function () {
      this._id = structureId;
      return Promise.resolve(this);
    };

    const structure = await feeService.createFeeStructure(
      {
        academicSessionId: sessionId,
        classId,
        feeCategoryId: categoryId,
        name: 'Grade 10 Tuition Fee',
        amount: 3000,
        frequency: 'MONTHLY',
      },
      adminUser
    );

    AcademicSession.findOne = origSessionFindOne;
    Class.findOne = origClassFindOne;
    FeeCategory.findOne = origCategoryFindOne;
    FeeStructure.prototype.save = origStructureSave;

    assert.equal(structure.amount, 3000);
    assert.equal(structure.name, 'Grade 10 Tuition Fee');
  });

  it('should create fee concession policy', async () => {
    const origConcessionSave = FeeConcession.prototype.save;

    FeeConcession.prototype.save = function () {
      this._id = concessionId;
      return Promise.resolve(this);
    };

    const concession = await feeService.createFeeConcession(
      {
        name: 'Sibling Discount',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        reason: 'Sibling discount',
      },
      adminUser
    );

    FeeConcession.prototype.save = origConcessionSave;

    assert.equal(concession.discountValue, 10);
  });

  it('should generate student fee invoices and apply concession discount', async () => {
    const origSessionFindOne = AcademicSession.findOne;
    const origClassFindOne = Class.findOne;
    const origStructureFind = FeeStructure.find;
    const origConcessionFindOne = FeeConcession.findOne;
    const origStudentFindOne = Student.findOne;
    const origInvoiceCount = FeeInvoice.countDocuments;
    const origInvoiceSave = FeeInvoice.prototype.save;

    AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    FeeStructure.find = () =>
      Promise.resolve([
        {
          _id: structureId,
          feeCategoryId: categoryId,
          name: 'Grade 10 Tuition',
          amount: 2000,
        },
      ]);
    FeeConcession.findOne = () =>
      Promise.resolve({
        _id: concessionId,
        discountType: 'PERCENTAGE',
        discountValue: 10, // 10% off of 2000 = 200 discount, net = 1800
      });
    Student.findOne = () =>
      Promise.resolve({
        _id: studentId,
        schoolId,
        classId,
        sectionId,
      });
    FeeInvoice.countDocuments = () => Promise.resolve(0);
    FeeInvoice.prototype.save = function () {
      this._id = invoiceId;
      return Promise.resolve(this);
    };

    const invoices = await feeService.generateInvoices(
      {
        academicSessionId: sessionId,
        classId,
        studentId,
        feeStructureIds: [structureId],
        concessionId,
        title: 'Q1 Fee Challan',
        dueDate: '2026-10-31',
      },
      adminUser
    );

    AcademicSession.findOne = origSessionFindOne;
    Class.findOne = origClassFindOne;
    FeeStructure.find = origStructureFind;
    FeeConcession.findOne = origConcessionFindOne;
    Student.findOne = origStudentFindOne;
    FeeInvoice.countDocuments = origInvoiceCount;
    FeeInvoice.prototype.save = origInvoiceSave;

    assert.equal(invoices.length, 1);
    assert.equal(invoices[0].subtotal, 2000);
    assert.equal(invoices[0].totalDiscount, 200);
    assert.equal(invoices[0].totalAmount, 1800);
    assert.equal(invoices[0].balanceAmount, 1800);
    assert.equal(invoices[0].status, INVOICE_STATUS.UNPAID);
  });

  it('should record partial payment and update invoice balance', async () => {
    const mockInvoice = {
      _id: invoiceId,
      schoolId,
      academicSessionId: sessionId,
      studentId,
      totalAmount: 1800,
      paidAmount: 0,
      balanceAmount: 1800,
      status: INVOICE_STATUS.UNPAID,
      save: function () {
        return Promise.resolve(this);
      },
      toJSON: function () {
        return { ...this };
      },
    };

    const origInvoiceFindOne = FeeInvoice.findOne;
    const origPaymentCount = FeePayment.countDocuments;
    const origPaymentSave = FeePayment.prototype.save;

    FeeInvoice.findOne = () => Promise.resolve(mockInvoice);
    FeePayment.countDocuments = () => Promise.resolve(0);
    FeePayment.prototype.save = function () {
      this._id = 'payment-1';
      return Promise.resolve(this);
    };

    const result = await feeService.recordPayment(
      {
        invoiceId,
        amountPaid: 800,
        paymentMethod: 'CASH',
        remarks: 'First installment',
      },
      adminUser
    );

    FeeInvoice.findOne = origInvoiceFindOne;
    FeePayment.countDocuments = origPaymentCount;
    FeePayment.prototype.save = origPaymentSave;

    assert.equal(result.payment.amountPaid, 800);
    assert.equal(result.invoice.paidAmount, 800);
    assert.equal(result.invoice.balanceAmount, 1000);
    assert.equal(result.invoice.status, INVOICE_STATUS.PARTIALLY_PAID);
  });

  it('should record final payment and mark invoice PAID', async () => {
    const mockInvoice = {
      _id: invoiceId,
      schoolId,
      academicSessionId: sessionId,
      studentId,
      totalAmount: 1800,
      paidAmount: 800,
      balanceAmount: 1000,
      status: INVOICE_STATUS.PARTIALLY_PAID,
      save: function () {
        return Promise.resolve(this);
      },
      toJSON: function () {
        return { ...this };
      },
    };

    const origInvoiceFindOne = FeeInvoice.findOne;
    const origPaymentCount = FeePayment.countDocuments;
    const origPaymentSave = FeePayment.prototype.save;

    FeeInvoice.findOne = () => Promise.resolve(mockInvoice);
    FeePayment.countDocuments = () => Promise.resolve(1);
    FeePayment.prototype.save = function () {
      this._id = 'payment-2';
      return Promise.resolve(this);
    };

    const result = await feeService.recordPayment(
      {
        invoiceId,
        amountPaid: 1000,
        paymentMethod: 'BANK_TRANSFER',
      },
      adminUser
    );

    FeeInvoice.findOne = origInvoiceFindOne;
    FeePayment.countDocuments = origPaymentCount;
    FeePayment.prototype.save = origPaymentSave;

    assert.equal(result.payment.amountPaid, 1000);
    assert.equal(result.invoice.paidAmount, 1800);
    assert.equal(result.invoice.balanceAmount, 0);
    assert.equal(result.invoice.status, INVOICE_STATUS.PAID);
  });

  it('should reject payment if amount exceeds outstanding balance', async () => {
    const mockInvoice = {
      _id: invoiceId,
      schoolId,
      academicSessionId: sessionId,
      studentId,
      totalAmount: 1000,
      paidAmount: 0,
      balanceAmount: 1000,
      status: INVOICE_STATUS.UNPAID,
    };

    const origInvoiceFindOne = FeeInvoice.findOne;
    FeeInvoice.findOne = () => Promise.resolve(mockInvoice);

    await assert.rejects(
      () =>
        feeService.recordPayment(
          {
            invoiceId,
            amountPaid: 1500, // Exceeds balance of 1000
          },
          adminUser
        ),
      (err) => err.statusCode === 400 && err.message.includes('exceeds invoice balance')
    );

    FeeInvoice.findOne = origInvoiceFindOne;
  });

  it('should get financial summary report aggregates', async () => {
    const origInvoiceAggregate = FeeInvoice.aggregate;
    const origPaymentAggregate = FeePayment.aggregate;

    FeeInvoice.aggregate = () =>
      Promise.resolve([
        {
          _id: null,
          totalInvoiced: 50000,
          totalPaid: 35000,
          totalOutstanding: 15000,
          totalCount: 25,
        },
      ]);

    FeePayment.aggregate = () =>
      Promise.resolve([
        { _id: 'CASH', amount: 20000, count: 10 },
        { _id: 'ONLINE', amount: 15000, count: 8 },
      ]);

    const result = await feeService.getFinancialSummary(adminUser);

    FeeInvoice.aggregate = origInvoiceAggregate;
    FeePayment.aggregate = origPaymentAggregate;

    assert.equal(result.summary.totalInvoiced, 50000);
    assert.equal(result.summary.totalPaid, 35000);
    assert.equal(result.summary.totalOutstanding, 15000);
    assert.equal(result.collectionByMethod.length, 2);
  });

  it('should calculate flat amount concession correctly on invoice generation', async () => {
    const origSessionFindOne = AcademicSession.findOne;
    const origClassFindOne = Class.findOne;
    const origStructureFind = FeeStructure.find;
    const origConcessionFindOne = FeeConcession.findOne;
    const origStudentFindOne = Student.findOne;
    const origInvoiceCount = FeeInvoice.countDocuments;
    const origInvoiceSave = FeeInvoice.prototype.save;

    AcademicSession.findOne = () => Promise.resolve({ _id: sessionId, schoolId });
    Class.findOne = () => Promise.resolve({ _id: classId, schoolId });
    FeeStructure.find = () =>
      Promise.resolve([
        {
          _id: structureId,
          feeCategoryId: categoryId,
          name: 'Annual Sports Fee',
          amount: 1500,
        },
      ]);
    FeeConcession.findOne = () =>
      Promise.resolve({
        _id: concessionId,
        discountType: 'FLAT',
        discountValue: 500, // Flat 500 discount on 1500 = 1000 net
      });
    Student.findOne = () =>
      Promise.resolve({
        _id: studentId,
        schoolId,
        classId,
        sectionId,
      });
    FeeInvoice.countDocuments = () => Promise.resolve(5);
    FeeInvoice.prototype.save = function () {
      this._id = invoiceId;
      return Promise.resolve(this);
    };

    const invoices = await feeService.generateInvoices(
      {
        academicSessionId: sessionId,
        classId,
        studentId,
        feeStructureIds: [structureId],
        concessionId,
        title: 'Sports Fee Challan',
        dueDate: '2026-11-30',
      },
      adminUser
    );

    AcademicSession.findOne = origSessionFindOne;
    Class.findOne = origClassFindOne;
    FeeStructure.find = origStructureFind;
    FeeConcession.findOne = origConcessionFindOne;
    Student.findOne = origStudentFindOne;
    FeeInvoice.countDocuments = origInvoiceCount;
    FeeInvoice.prototype.save = origInvoiceSave;

    assert.equal(invoices[0].subtotal, 1500);
    assert.equal(invoices[0].totalDiscount, 500);
    assert.equal(invoices[0].totalAmount, 1000);
  });

  it('should retrieve paginated fee invoices list', async () => {
    const origInvoiceFind = FeeInvoice.find;
    const origInvoiceCount = FeeInvoice.countDocuments;

    const mockQuery = {
      populate: () => mockQuery,
      sort: () => mockQuery,
      skip: () => mockQuery,
      limit: () =>
        Promise.resolve([
          {
            _id: invoiceId,
            invoiceNumber: 'INV-2026-00001',
            totalAmount: 1800,
            status: 'UNPAID',
            toJSON: () => ({ id: invoiceId, invoiceNumber: 'INV-2026-00001', totalAmount: 1800 }),
          },
        ]),
    };

    FeeInvoice.find = () => mockQuery;
    FeeInvoice.countDocuments = () => Promise.resolve(1);

    const result = await feeService.getInvoices({ page: 1, limit: 20 }, adminUser);

    FeeInvoice.find = origInvoiceFind;
    FeeInvoice.countDocuments = origInvoiceCount;

    assert.equal(result.invoices.length, 1);
    assert.equal(result.pagination.total, 1);
  });

  it('should retrieve fee defaulters list with overdue invoices', async () => {
    const origInvoiceFind = FeeInvoice.find;

    const mockQuery = {
      populate: () => mockQuery,
      sort: () =>
        Promise.resolve([
          {
            _id: invoiceId,
            invoiceNumber: 'INV-2026-00001',
            balanceAmount: 1800,
            dueDate: new Date('2026-08-01'),
            toJSON: () => ({ id: invoiceId, invoiceNumber: 'INV-2026-00001', balanceAmount: 1800 }),
          },
        ]),
    };

    FeeInvoice.find = () => mockQuery;

    const defaulters = await feeService.getDefaulters(adminUser);

    FeeInvoice.find = origInvoiceFind;

    assert.equal(defaulters.length, 1);
    assert.equal(defaulters[0].balanceAmount, 1800);
  });
});
