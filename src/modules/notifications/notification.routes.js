import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import requirePermission from '../../middlewares/requirePermission.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';
import * as notificationController from './notification.controller.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenant);
router.use(sanitizeBody(...PROTECTED_FIELDS));

router.get('/', requirePermission(PERMISSIONS.NOTIFICATIONS_READ), notificationController.getUserNotifications);
router.patch('/:id/read', requirePermission(PERMISSIONS.NOTIFICATIONS_READ), notificationController.markNotificationAsRead);
router.post('/read-all', requirePermission(PERMISSIONS.NOTIFICATIONS_READ), notificationController.markAllNotificationsAsRead);

export default router;
