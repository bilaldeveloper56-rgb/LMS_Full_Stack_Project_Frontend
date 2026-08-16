import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as feeService from './fee.service.js';
import {
  createFeeCategorySchema,
  createFeeStructureSchema,
  createFeeConcessionSchema,
  generateInvoiceSchema,
  recordPaymentSchema,
  queryInvoiceSchema,
  queryPaymentSchema,
} from './fee.validator.js';

export const createFeeCategory = asyncHandler(async (req, res) => {
  const validated = createFeeCategorySchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const category = await feeService.createFeeCategory(validated, req.user, meta);
  return sendCreated(res, 'Fee category created successfully', { category });
});

export const getFeeCategories = asyncHandler(async (req, res) => {
  const categories = await feeService.getFeeCategories(req.user);
  return sendSuccess(res, 200, 'Fee categories retrieved successfully', { categories });
});

export const createFeeStructure = asyncHandler(async (req, res) => {
  const validated = createFeeStructureSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const structure = await feeService.createFeeStructure(validated, req.user, meta);
  return sendCreated(res, 'Fee structure created successfully', { structure });
});

export const getFeeStructures = asyncHandler(async (req, res) => {
  const structures = await feeService.getFeeStructures(req.query, req.user);
  return sendSuccess(res, 200, 'Fee structures retrieved successfully', { structures });
});

export const createFeeConcession = asyncHandler(async (req, res) => {
  const validated = createFeeConcessionSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const concession = await feeService.createFeeConcession(validated, req.user, meta);
  return sendCreated(res, 'Fee concession created successfully', { concession });
});

export const getFeeConcessions = asyncHandler(async (req, res) => {
  const concessions = await feeService.getFeeConcessions(req.user);
  return sendSuccess(res, 200, 'Fee concessions retrieved successfully', { concessions });
});

export const generateInvoices = asyncHandler(async (req, res) => {
  const validated = generateInvoiceSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const invoices = await feeService.generateInvoices(validated, req.user, meta);
  return sendCreated(res, 'Fee invoices generated successfully', { invoices, count: invoices.length });
});

export const getInvoices = asyncHandler(async (req, res) => {
  const validated = queryInvoiceSchema.parse(req.query);
  const result = await feeService.getInvoices(validated, req.user);
  return sendPaginated(res, 'Fee invoices retrieved successfully', result.invoices, result.pagination);
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await feeService.getInvoiceById(req.params.id, req.user);
  return sendSuccess(res, 200, 'Fee invoice retrieved successfully', { invoice });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const validated = recordPaymentSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await feeService.recordPayment(validated, req.user, meta);
  return sendCreated(res, 'Payment recorded successfully', result);
});

export const getPayments = asyncHandler(async (req, res) => {
  const validated = queryPaymentSchema.parse(req.query);
  const result = await feeService.getPayments(validated, req.user);
  return sendPaginated(res, 'Payments retrieved successfully', result.payments, result.pagination);
});

export const getDefaulters = asyncHandler(async (req, res) => {
  const defaulters = await feeService.getDefaulters(req.user);
  return sendSuccess(res, 200, 'Fee defaulters retrieved successfully', { defaulters });
});

export const getFinancialSummary = asyncHandler(async (req, res) => {
  const summary = await feeService.getFinancialSummary(req.user);
  return sendSuccess(res, 200, 'Financial summary retrieved successfully', summary);
});
