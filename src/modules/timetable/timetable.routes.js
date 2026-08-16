import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import requirePermission from '../../middlewares/requirePermission.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';
import * as timetableController from './timetable.controller.js';

const router = Router();

// All timetable endpoints require authentication and tenant isolation
router.use(authenticate);
router.use(enforceTenant);
router.use(sanitizeBody(...PROTECTED_FIELDS));

// CRUD and Specific Timetable views
router.post('/', requirePermission(PERMISSIONS.TIMETABLE_CREATE), timetableController.createTimetableEntry);
router.get('/', requirePermission(PERMISSIONS.TIMETABLE_READ), timetableController.getTimetableList);
router.get('/section/:sectionId', requirePermission(PERMISSIONS.TIMETABLE_READ), timetableController.getSectionTimetable);
router.get('/teacher/:teacherId', requirePermission(PERMISSIONS.TIMETABLE_READ), timetableController.getTeacherTimetable);
router.patch('/:id', requirePermission(PERMISSIONS.TIMETABLE_UPDATE), timetableController.updateTimetableEntry);
router.delete('/:id', requirePermission(PERMISSIONS.TIMETABLE_DELETE), timetableController.deleteTimetableEntry);

export default router;
