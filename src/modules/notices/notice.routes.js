import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { enforceTenant } from '../../middlewares/tenantIsolation.js';
import requirePermission from '../../middlewares/requirePermission.js';
import sanitizeBody from '../../middlewares/sanitizeFields.js';
import { PERMISSIONS, PROTECTED_FIELDS } from '../../constants/index.js';
import * as noticeController from './notice.controller.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenant);
router.use(sanitizeBody(...PROTECTED_FIELDS));

router.post('/', requirePermission(PERMISSIONS.NOTICES_CREATE), noticeController.createNotice);
router.get('/', requirePermission(PERMISSIONS.NOTICES_READ), noticeController.getNotices);
router.get('/:id', requirePermission(PERMISSIONS.NOTICES_READ), noticeController.getNoticeById);
router.patch('/:id', requirePermission(PERMISSIONS.NOTICES_UPDATE), noticeController.updateNotice);
router.delete('/:id', requirePermission(PERMISSIONS.NOTICES_DELETE), noticeController.deleteNotice);
router.post('/:id/publish', requirePermission(PERMISSIONS.NOTICES_PUBLISH), noticeController.publishNotice);

export default router;
