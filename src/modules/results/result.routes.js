import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import requirePermission from '../../middlewares/requirePermission.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';
import * as resultController from './result.controller.js';

const router = Router();

// All result endpoints require authentication, tenant isolation, and body sanitization
router.use(authenticate);
router.use(enforceTenant);
router.use(sanitizeBody(...PROTECTED_FIELDS));

// Grading Scales
router.post('/grading-scales', requirePermission(PERMISSIONS.RESULTS_CREATE), resultController.createGradingScale);
router.get('/grading-scales', requirePermission(PERMISSIONS.RESULTS_READ), resultController.getGradingScales);

// Marks Entry
router.post('/marks', requirePermission(PERMISSIONS.RESULTS_CREATE), resultController.recordMarks);
router.post('/marks/bulk', requirePermission(PERMISSIONS.RESULTS_CREATE), resultController.bulkRecordMarks);

// Results Views & Reports
router.get('/student/:studentId', requirePermission(PERMISSIONS.RESULTS_READ), resultController.getStudentReportCard);
router.get('/exam/:examId/section/:sectionId', requirePermission(PERMISSIONS.RESULTS_READ), resultController.getSectionResults);

// Locking & Publishing Controls
router.post('/exam/:examId/section/:sectionId/lock', requirePermission(PERMISSIONS.RESULTS_LOCK), resultController.lockSectionResults);
router.post('/exam/:examId/section/:sectionId/unlock', requirePermission(PERMISSIONS.RESULTS_LOCK), resultController.unlockSectionResults);
router.post('/exam/:examId/section/:sectionId/publish', requirePermission(PERMISSIONS.RESULTS_PUBLISH), resultController.publishSectionResults);

export default router;
