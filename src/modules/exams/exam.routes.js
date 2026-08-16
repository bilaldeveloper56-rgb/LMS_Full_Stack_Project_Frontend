import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import requirePermission from '../../middlewares/requirePermission.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';
import * as examController from './exam.controller.js';

const router = Router();

// All exam endpoints require authentication, tenant isolation, and body sanitization
router.use(authenticate);
router.use(enforceTenant);
router.use(sanitizeBody(...PROTECTED_FIELDS));

// Exam Terms & Schedules
router.post('/', requirePermission(PERMISSIONS.EXAMS_CREATE), examController.createExam);
router.get('/', requirePermission(PERMISSIONS.EXAMS_READ), examController.getExamsList);
router.get('/:id', requirePermission(PERMISSIONS.EXAMS_READ), examController.getExamById);
router.patch('/:id', requirePermission(PERMISSIONS.EXAMS_UPDATE), examController.updateExam);
router.delete('/:id', requirePermission(PERMISSIONS.EXAMS_DELETE), examController.deleteExam);
router.post('/:id/publish', requirePermission(PERMISSIONS.EXAMS_PUBLISH), examController.publishExam);

// Exam Paper Scheduling
router.post('/:id/papers', requirePermission(PERMISSIONS.EXAMS_CREATE), examController.scheduleExamPaper);

export default router;
