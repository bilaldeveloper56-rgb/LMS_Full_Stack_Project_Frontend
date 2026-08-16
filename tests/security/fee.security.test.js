import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import FeeInvoice from '../../src/modules/fees/feeInvoice.model.js';
import Student from '../../src/modules/students/student.model.js';
import Parent from '../../src/modules/parents/parent.model.js';
import StudentParent from '../../src/modules/parents/studentParent.model.js';
import * as feeService from '../../src/modules/fees/fee.service.js';
import { ROLES, PROTECTED_FIELDS } from '../../src/constants/index.js';
import sanitizeBody from '../../src/middlewares/sanitizeFields.js';

describe('Phase 8 Fee Security & Multi-Tenancy Tests', () => {
  const schoolA = '507f1f77bcf86cd799439011';
  const schoolB = '507f1f77bcf86cd799439099';
  const studentA = '507f1f77bcf86cd799439022';
  const studentB = '507f1f77bcf86cd799439033';
  const invoiceA = '507f1f77bcf86cd799439044';

  const studentUserA = { id: 'user-student-A', role: ROLES.STUDENT, schoolId: schoolA };
  const parentUserB = { id: 'user-parent-B', role: ROLES.PARENT, schoolId: schoolA };

  it('should prevent student from accessing another student invoice', async () => {
    const origStudentFindOne = Student.findOne;
    const origInvoiceFindOne = FeeInvoice.findOne;

    Student.findOne = () =>
      Promise.resolve({
        _id: studentA,
        userId: studentUserA.id,
        schoolId: schoolA,
      });

    const mockQuery = {
      populate: () => mockQuery,
      then: (resolve) =>
        resolve({
          _id: invoiceA,
          schoolId: schoolA,
          studentId: { _id: studentB }, // Belongs to Student B!
        }),
    };
    FeeInvoice.findOne = () => mockQuery;

    await assert.rejects(
      () => feeService.getInvoiceById(invoiceA, studentUserA),
      (err) => err.statusCode === 403 && err.message.includes('own invoices')
    );

    Student.findOne = origStudentFindOne;
    FeeInvoice.findOne = origInvoiceFindOne;
  });

  it('should prevent parent from accessing invoice of unlinked child', async () => {
    const origParentFindOne = Parent.findOne;
    const origStudentParentFindOne = StudentParent.findOne;
    const origInvoiceFindOne = FeeInvoice.findOne;

    Parent.findOne = () =>
      Promise.resolve({
        _id: 'parent-profile-1',
        userId: parentUserB.id,
        schoolId: schoolA,
      });

    StudentParent.findOne = () => Promise.resolve(null); // No link to this student!

    const mockQuery = {
      populate: () => mockQuery,
      then: (resolve) =>
        resolve({
          _id: invoiceA,
          schoolId: schoolA,
          studentId: { _id: studentA },
        }),
    };
    FeeInvoice.findOne = () => mockQuery;

    await assert.rejects(
      () => feeService.getInvoiceById(invoiceA, parentUserB),
      (err) => err.statusCode === 403 && err.message.includes('linked children')
    );

    Parent.findOne = origParentFindOne;
    StudentParent.findOne = origStudentParentFindOne;
    FeeInvoice.findOne = origInvoiceFindOne;
  });

  it('should strip financial protected fields in sanitizeBody middleware', () => {
    const req = {
      body: {
        title: 'Monthly Fee',
        paidAmount: 50000,
        balanceAmount: 0,
        totalAmount: 100,
        invoiceNumber: 'HACKED-INV-001',
        receiptNumber: 'HACKED-REC-001',
        receivedBy: 'hacker-id',
        status: 'PAID',
        schoolId: 'injected-school-id',
      },
    };
    const res = {};
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    const middleware = sanitizeBody(...PROTECTED_FIELDS);
    middleware(req, res, next);

    assert.equal(nextCalled, true);
    assert.equal(req.body.title, 'Monthly Fee');
    assert.equal(req.body.paidAmount, undefined);
    assert.equal(req.body.balanceAmount, undefined);
    assert.equal(req.body.totalAmount, undefined);
    assert.equal(req.body.invoiceNumber, undefined);
    assert.equal(req.body.receiptNumber, undefined);
    assert.equal(req.body.receivedBy, undefined);
    assert.equal(req.body.status, undefined);
    assert.equal(req.body.schoolId, undefined);
  });
});
