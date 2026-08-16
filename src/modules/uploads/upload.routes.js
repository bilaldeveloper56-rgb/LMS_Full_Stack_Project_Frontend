import { Router } from 'express';
import authenticate from '../../middlewares/authenticate.js';
import {
  uploadGeneral,
  uploadAvatar,
  uploadDocument,
} from '../../middlewares/upload.middleware.js';
import {
  uploadGeneralFile,
  uploadAvatarFile,
  uploadDocumentFile,
} from './upload.controller.js';

const router = Router();

// All upload endpoints strictly require an active authenticated user
router.use(authenticate);

/**
 * @route   POST /api/v1/uploads
 * @desc    Upload any approved image or document file (max 10 MB)
 * @access  Private (Authenticated users)
 */
router.post('/', uploadGeneral, uploadGeneralFile);

/**
 * @route   POST /api/v1/uploads/avatar
 * @desc    Upload a user profile avatar or school logo image (max 2 MB, images only)
 * @access  Private (Authenticated users)
 */
router.post('/avatar', uploadAvatar, uploadAvatarFile);

/**
 * @route   POST /api/v1/uploads/document
 * @desc    Upload an assignment, circular, or homework document (max 10 MB, PDF/DOC/DOCX/TXT)
 * @access  Private (Authenticated users)
 */
router.post('/document', uploadDocument, uploadDocumentFile);

export default router;
