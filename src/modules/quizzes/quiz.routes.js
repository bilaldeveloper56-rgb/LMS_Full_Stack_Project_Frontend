import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import requirePermission from '../../middlewares/requirePermission.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';
import * as quizController from './quiz.controller.js';

const router = Router();

// All quiz endpoints require authentication, tenant isolation, and body sanitization
router.use(authenticate);
router.use(enforceTenant);
router.use(sanitizeBody(...PROTECTED_FIELDS));

// Quiz Management
router.post('/', requirePermission(PERMISSIONS.QUIZZES_CREATE), quizController.createQuiz);
router.get('/', requirePermission(PERMISSIONS.QUIZZES_READ), quizController.getQuizzesList);
router.get('/:id', requirePermission(PERMISSIONS.QUIZZES_READ), quizController.getQuizById);
router.patch('/:id', requirePermission(PERMISSIONS.QUIZZES_UPDATE), quizController.updateQuiz);
router.delete('/:id', requirePermission(PERMISSIONS.QUIZZES_DELETE), quizController.deleteQuiz);
router.post('/:id/publish', requirePermission(PERMISSIONS.QUIZZES_UPDATE), quizController.publishQuiz);

// Quiz Attempts & Grading
router.post('/:id/start', requirePermission(PERMISSIONS.QUIZZES_READ), quizController.startQuizAttempt);
router.post('/attempts/:id/submit', requirePermission(PERMISSIONS.QUIZZES_READ), quizController.submitQuizAttempt);
router.patch('/attempts/:id/grade', requirePermission(PERMISSIONS.QUIZZES_GRADE), quizController.gradeQuizAttempt);

export default router;
