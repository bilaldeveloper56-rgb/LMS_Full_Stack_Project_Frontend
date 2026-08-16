import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import requirePermission from '../../middlewares/requirePermission.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';
import * as feeController from './fee.controller.js';

const router = Router();

// All fee endpoints require authentication, tenant isolation, and body sanitization
router.use(authenticate);
router.use(enforceTenant);
router.use(sanitizeBody(...PROTECTED_FIELDS));

// Categories
router.post('/categories', requirePermission(PERMISSIONS.FEES_CREATE), feeController.createFeeCategory);
router.get('/categories', requirePermission(PERMISSIONS.FEES_READ), feeController.getFeeCategories);

// Structures
router.post('/structures', requirePermission(PERMISSIONS.FEES_CREATE), feeController.createFeeStructure);
router.get('/structures', requirePermission(PERMISSIONS.FEES_READ), feeController.getFeeStructures);

// Concessions
router.post('/concessions', requirePermission(PERMISSIONS.FEES_CREATE), feeController.createFeeConcession);
router.get('/concessions', requirePermission(PERMISSIONS.FEES_READ), feeController.getFeeConcessions);

// Invoices
router.post('/invoices/generate', requirePermission(PERMISSIONS.FEES_CREATE), feeController.generateInvoices);
router.get('/invoices', requirePermission(PERMISSIONS.FEES_READ), feeController.getInvoices);
router.get('/invoices/:id', requirePermission(PERMISSIONS.FEES_READ), feeController.getInvoiceById);

// Payments
router.post('/payments', requirePermission(PERMISSIONS.PAYMENTS_CREATE), feeController.recordPayment);
router.get('/payments', requirePermission(PERMISSIONS.PAYMENTS_READ), feeController.getPayments);

// Reports & Defaulters
router.get('/defaulters', requirePermission(PERMISSIONS.FEES_MANAGE), feeController.getDefaulters);
router.get('/reports/summary', requirePermission(PERMISSIONS.REPORTS_READ), feeController.getFinancialSummary);

export default router;
