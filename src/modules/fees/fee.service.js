import mongoose from 'mongoose';
import FeeCategory from './feeCategory.model.js';
import FeeStructure from './feeStructure.model.js';
import FeeConcession from './feeConcession.model.js';
import FeeInvoice from './feeInvoice.model.js';
import FeePayment from './feePayment.model.js';
import AcademicSession from '../academics/academicSession.model.js';
import Class from '../academics/class.model.js';
import Section from '../academics/section.model.js';
import Student from '../students/student.model.js';
import Parent from '../parents/parent.model.js';
import StudentParent from '../parents/studentParent.model.js';
import School from '../schools/school.model.js';
import AppError from '../../utils/AppError.js';
import { logAuditEvent } from '../audit/audit.service.js';
import {
  AUTH_EVENTS,
  ROLES,
  INVOICE_STATUS,
  PAYMENT_STATUS,
  DISCOUNT_TYPE,
} from '../../constants/index.js';

export async function generateInvoiceNumber(schoolId) {
  const year = new Date().getFullYear();
  const count = await FeeInvoice.countDocuments({ schoolId });
  const seq = String(count + 1).padStart(5, '0');
  return `INV-${year}-${seq}`;
}

export async function generateReceiptNumber(schoolId) {
  const year = new Date().getFullYear();
  const count = await FeePayment.countDocuments({ schoolId });
  const seq = String(count + 1).padStart(5, '0');
  return `REC-${year}-${seq}`;
}

// 1. Fee Categories
export async function createFeeCategory(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const school = await School.findById(schoolId);
  if (!school || school.isDeleted) throw AppError.notFound('School not found or inactive');

  const category = new FeeCategory({
    ...data,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await category.save();

  await logAuditEvent({
    event: AUTH_EVENTS.FEE_CATEGORY_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'FeeCategory',
    entityId: category._id,
    details: { name: category.name },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return category.toJSON();
}

export async function getFeeCategories(user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;
  const categories = await FeeCategory.find(query).sort({ name: 1 });
  return categories.map((c) => c.toJSON());
}

// 2. Fee Structures
export async function createFeeStructure(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const [session, cls, category] = await Promise.all([
    AcademicSession.findOne({ _id: data.academicSessionId, schoolId }),
    Class.findOne({ _id: data.classId, schoolId }),
    FeeCategory.findOne({ _id: data.feeCategoryId, schoolId }),
  ]);

  if (!session) throw AppError.notFound('Academic session not found');
  if (!cls) throw AppError.notFound('Class not found');
  if (!category) throw AppError.notFound('Fee category not found');

  const structure = new FeeStructure({
    ...data,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await structure.save();

  await logAuditEvent({
    event: AUTH_EVENTS.FEE_STRUCTURE_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'FeeStructure',
    entityId: structure._id,
    details: { name: structure.name, amount: structure.amount, classId: data.classId },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return structure.toJSON();
}

export async function getFeeStructures(filters, user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;
  if (filters.academicSessionId) query.academicSessionId = filters.academicSessionId;
  if (filters.classId) query.classId = filters.classId;
  if (filters.feeCategoryId) query.feeCategoryId = filters.feeCategoryId;

  const structures = await FeeStructure.find(query)
    .populate('feeCategoryId', 'name')
    .populate('classId', 'name')
    .sort({ classId: 1, name: 1 });

  return structures.map((s) => s.toJSON());
}

// 3. Fee Concessions
export async function createFeeConcession(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const concession = new FeeConcession({
    ...data,
    schoolId,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await concession.save();

  await logAuditEvent({
    event: AUTH_EVENTS.FEE_CONCESSION_CREATED,
    userId: user.id,
    schoolId,
    entityType: 'FeeConcession',
    entityId: concession._id,
    details: { name: concession.name, discountType: concession.discountType, discountValue: concession.discountValue },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return concession.toJSON();
}

export async function getFeeConcessions(user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;
  const concessions = await FeeConcession.find(query).sort({ name: 1 });
  return concessions.map((c) => c.toJSON());
}

// 4. Invoicing
export async function generateInvoices(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? data.schoolId || user.schoolId : user.schoolId;
  if (!schoolId) throw AppError.badRequest('School ID is required');

  const [session, cls, structures] = await Promise.all([
    AcademicSession.findOne({ _id: data.academicSessionId, schoolId }),
    Class.findOne({ _id: data.classId, schoolId }),
    FeeStructure.find({ _id: { $in: data.feeStructureIds }, schoolId }),
  ]);

  if (!session) throw AppError.notFound('Academic session not found');
  if (!cls) throw AppError.notFound('Class not found');
  if (structures.length === 0) throw AppError.badRequest('No valid fee structures found');

  let concession = null;
  if (data.concessionId) {
    concession = await FeeConcession.findOne({ _id: data.concessionId, schoolId });
  }

  // Determine students to bill
  let students = [];
  if (data.studentId) {
    const student = await Student.findOne({ _id: data.studentId, schoolId, classId: data.classId });
    if (!student) throw AppError.notFound('Student not found in this class');
    students = [student];
  } else {
    const studentQuery = { schoolId, classId: data.classId, enrollmentStatus: 'ACTIVE' };
    if (data.sectionId) studentQuery.sectionId = data.sectionId;
    students = await Student.find(studentQuery);
  }

  if (students.length === 0) {
    throw AppError.notFound('No active students found matching invoice criteria');
  }

  const generatedInvoices = [];
  let baseCount = await FeeInvoice.countDocuments({ schoolId });

  for (const student of students) {
    baseCount++;
    const year = data.year || new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(baseCount).padStart(5, '0')}`;

    let subtotal = 0;
    const lineItems = structures.map((st) => {
      const baseAmount = st.amount;
      subtotal += baseAmount;
      return {
        feeStructureId: st._id,
        feeCategoryId: st.feeCategoryId,
        name: st.name,
        baseAmount,
        discountAmount: 0,
        fineAmount: 0,
        netAmount: baseAmount,
      };
    });

    let totalDiscount = 0;
    if (concession) {
      if (concession.discountType === DISCOUNT_TYPE.PERCENTAGE) {
        totalDiscount = Number(((subtotal * concession.discountValue) / 100).toFixed(2));
      } else {
        totalDiscount = Math.min(subtotal, concession.discountValue);
      }
    }

    const totalAmount = Math.max(0, Number((subtotal - totalDiscount).toFixed(2)));
    const balanceAmount = totalAmount;

    const invoice = new FeeInvoice({
      schoolId,
      academicSessionId: session._id,
      studentId: student._id,
      classId: student.classId,
      sectionId: student.sectionId,
      invoiceNumber,
      title: data.title,
      month: data.month || null,
      year: data.year || year,
      lineItems,
      subtotal,
      totalDiscount,
      totalFine: 0,
      totalAmount,
      paidAmount: 0,
      balanceAmount,
      dueDate: new Date(data.dueDate),
      status: INVOICE_STATUS.UNPAID,
      createdBy: user.id,
      updatedBy: user.id,
    });

    await invoice.save();
    generatedInvoices.push(invoice.toJSON());
  }

  await logAuditEvent({
    event: AUTH_EVENTS.FEE_INVOICE_GENERATED,
    userId: user.id,
    schoolId,
    entityType: 'FeeInvoice',
    details: { count: generatedInvoices.length, classId: data.classId },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return generatedInvoices;
}

export async function getInvoices(filters, user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  } else if (filters.schoolId) {
    query.schoolId = filters.schoolId;
  }

  // Role Scoping
  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!student) throw AppError.forbidden('Student profile not found');
    query.studentId = student._id;
  } else if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!parent) throw AppError.forbidden('Parent profile not found');
    const links = await StudentParent.find({ parentId: parent._id, schoolId: user.schoolId });
    query.studentId = { $in: links.map((l) => l.studentId) };
  } else {
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.classId) query.classId = filters.classId;
    if (filters.sectionId) query.sectionId = filters.sectionId;
  }

  if (filters.academicSessionId) query.academicSessionId = filters.academicSessionId;
  if (filters.status) query.status = filters.status;

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [invoices, total] = await Promise.all([
    FeeInvoice.find(query)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    FeeInvoice.countDocuments(query),
  ]);

  return {
    invoices: invoices.map((inv) => inv.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getInvoiceById(id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw AppError.badRequest('Invalid invoice ID format');

  const query = { _id: id };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const invoice = await FeeInvoice.findOne(query)
    .populate('studentId', 'firstName lastName admissionNumber rollNumber')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .populate('academicSessionId', 'name');

  if (!invoice) throw AppError.notFound('Fee invoice not found');

  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!student || student._id.toString() !== invoice.studentId._id.toString()) {
      throw AppError.forbidden('Students can only access their own invoices');
    }
  }

  if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!parent) throw AppError.forbidden('Parent profile not found');
    const link = await StudentParent.findOne({ parentId: parent._id, studentId: invoice.studentId._id, schoolId: user.schoolId });
    if (!link) throw AppError.forbidden('Parents can only view invoices of their linked children');
  }

  return invoice.toJSON();
}

// 5. Payment & Receipt Recording
export async function recordPayment(data, user, meta = {}) {
  const schoolId = user.role === ROLES.SUPER_ADMIN ? user.schoolId : user.schoolId;
  const invoiceQuery = { _id: data.invoiceId };
  if (schoolId) invoiceQuery.schoolId = schoolId;

  const invoice = await FeeInvoice.findOne(invoiceQuery);
  if (!invoice) throw AppError.notFound('Fee invoice not found');

  if (invoice.status === INVOICE_STATUS.PAID) {
    throw AppError.badRequest('This invoice has already been fully paid');
  }

  if (invoice.status === INVOICE_STATUS.CANCELLED || invoice.status === INVOICE_STATUS.WAIVED) {
    throw AppError.badRequest(`Cannot record payment on a ${invoice.status.toLowerCase()} invoice`);
  }

  if (data.amountPaid > invoice.balanceAmount) {
    throw AppError.badRequest(`Payment amount (${data.amountPaid}) exceeds invoice balance (${invoice.balanceAmount})`);
  }

  const receiptNumber = await generateReceiptNumber(invoice.schoolId);

  const payment = new FeePayment({
    schoolId: invoice.schoolId,
    academicSessionId: invoice.academicSessionId,
    invoiceId: invoice._id,
    studentId: invoice.studentId,
    receiptNumber,
    amountPaid: data.amountPaid,
    paymentMethod: data.paymentMethod || 'CASH',
    transactionReference: data.transactionReference || '',
    remarks: data.remarks || '',
    receivedBy: user.id,
    status: PAYMENT_STATUS.SUCCESS,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await payment.save();

  invoice.paidAmount = Number((invoice.paidAmount + data.amountPaid).toFixed(2));
  invoice.balanceAmount = Math.max(0, Number((invoice.totalAmount - invoice.paidAmount).toFixed(2)));
  invoice.status = invoice.balanceAmount === 0 ? INVOICE_STATUS.PAID : INVOICE_STATUS.PARTIALLY_PAID;
  invoice.updatedBy = user.id;
  await invoice.save();

  await logAuditEvent({
    event: AUTH_EVENTS.FEE_PAYMENT_RECORDED,
    userId: user.id,
    schoolId: invoice.schoolId,
    entityType: 'FeePayment',
    entityId: payment._id,
    details: { receiptNumber, amountPaid: data.amountPaid, invoiceId: invoice._id },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return {
    payment: payment.toJSON(),
    invoice: invoice.toJSON(),
  };
}

export async function getPayments(filters, user) {
  const query = {};
  if (user.role !== ROLES.SUPER_ADMIN) {
    query.schoolId = user.schoolId;
  } else if (filters.schoolId) {
    query.schoolId = filters.schoolId;
  }

  if (user.role === ROLES.STUDENT) {
    const student = await Student.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!student) throw AppError.forbidden('Student profile not found');
    query.studentId = student._id;
  } else if (user.role === ROLES.PARENT) {
    const parent = await Parent.findOne({ userId: user.id, schoolId: user.schoolId });
    if (!parent) throw AppError.forbidden('Parent profile not found');
    const links = await StudentParent.find({ parentId: parent._id, schoolId: user.schoolId });
    query.studentId = { $in: links.map((l) => l.studentId) };
  } else {
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.invoiceId) query.invoiceId = filters.invoiceId;
  }

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    FeePayment.find(query)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('receivedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    FeePayment.countDocuments(query),
  ]);

  return {
    payments: payments.map((p) => p.toJSON()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getDefaulters(user) {
  const query = {
    dueDate: { $lt: new Date() },
    status: { $in: [INVOICE_STATUS.UNPAID, INVOICE_STATUS.PARTIALLY_PAID, INVOICE_STATUS.OVERDUE] },
  };
  if (user.role !== ROLES.SUPER_ADMIN) query.schoolId = user.schoolId;

  const defaulters = await FeeInvoice.find(query)
    .populate('studentId', 'firstName lastName admissionNumber phone')
    .populate('classId', 'name')
    .populate('sectionId', 'name')
    .sort({ dueDate: 1 });

  return defaulters.map((d) => d.toJSON());
}

export async function getFinancialSummary(user) {
  const match = { isDeleted: false };
  if (user.role !== ROLES.SUPER_ADMIN) {
    match.schoolId = new mongoose.Types.ObjectId(user.schoolId);
  }

  const [invoicesAgg, paymentsAgg] = await Promise.all([
    FeeInvoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalInvoiced: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: '$balanceAmount' },
          totalCount: { $sum: 1 },
        },
      },
    ]),
    FeePayment.aggregate([
      { $match: { ...match, status: 'SUCCESS' } },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$amountPaid' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const summary = invoicesAgg[0] || {
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    totalCount: 0,
  };

  return {
    summary: {
      totalInvoiced: summary.totalInvoiced || 0,
      totalPaid: summary.totalPaid || 0,
      totalOutstanding: summary.totalOutstanding || 0,
      totalInvoicesCount: summary.totalCount || 0,
    },
    collectionByMethod: paymentsAgg.map((p) => ({ method: p._id, amount: p.amount, count: p.count })),
  };
}
