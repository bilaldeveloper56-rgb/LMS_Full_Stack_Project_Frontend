import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import requirePermission from '../../middlewares/requirePermission.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';
import * as messageController from './message.controller.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenant);
router.use(sanitizeBody(...PROTECTED_FIELDS));

router.post('/conversations', requirePermission(PERMISSIONS.MESSAGES_CREATE), messageController.startConversation);
router.get('/conversations', requirePermission(PERMISSIONS.MESSAGES_READ), messageController.getConversations);
router.get('/conversations/:id', requirePermission(PERMISSIONS.MESSAGES_READ), messageController.getConversationMessages);
router.post('/conversations/:id/messages', requirePermission(PERMISSIONS.MESSAGES_CREATE), messageController.sendMessage);

export default router;
