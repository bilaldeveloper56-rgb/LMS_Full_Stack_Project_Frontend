import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import requirePermission from '../../middlewares/requirePermission.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';
import * as assignmentController from './assignment.controller.js';

const router = Router();

// All assignment endpoints require authentication, tenant isolation, and body sanitization
router.use(authenticate);
router.use(enforceTenant);
router.use(sanitizeBody(...PROTECTED_FIELDS));

// Assignment Management
router.post('/', requirePermission(PERMISSIONS.ASSIGNMENTS_CREATE), assignmentController.createAssignment);
router.get('/', requirePermission(PERMISSIONS.ASSIGNMENTS_READ), assignmentController.getAssignmentsList);
router.get('/:id', requirePermission(PERMISSIONS.ASSIGNMENTS_READ), assignmentController.getAssignmentById);
router.patch('/:id', requirePermission(PERMISSIONS.ASSIGNMENTS_UPDATE), assignmentController.updateAssignment);
router.delete('/:id', requirePermission(PERMISSIONS.ASSIGNMENTS_DELETE), assignmentController.deleteAssignment);
router.post('/:id/publish', requirePermission(PERMISSIONS.ASSIGNMENTS_UPDATE), assignmentController.publishAssignment);

// Submissions & Grading
router.post('/:id/submit', requirePermission(PERMISSIONS.ASSIGNMENTS_READ), assignmentController.submitAssignment);
router.get('/:id/submissions', requirePermission(PERMISSIONS.ASSIGNMENTS_GRADE), assignmentController.getAssignmentSubmissions);
router.patch('/submissions/:id/grade', requirePermission(PERMISSIONS.ASSIGNMENTS_GRADE), assignmentController.gradeSubmission);

export default router;
