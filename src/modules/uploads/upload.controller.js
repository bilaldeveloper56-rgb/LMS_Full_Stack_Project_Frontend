import { uploadFile } from '../../providers/cloudinary.provider.js';
import { ROLES } from '../../constants/index.js';
import AppError from '../../utils/AppError.js';

/**
 * Determine the tenant-safe Cloudinary folder path based on authenticated user context.
 *
 * @param {Object} user - The authenticated req.user object
 * @param {string} category - Upload category (e.g. 'avatars', 'documents', 'general')
 * @returns {string} - Cloudinary folder path
 */
export const resolveTenantFolder = (user, category = 'general') => {
  if (!user || user.role === ROLES.SUPER_ADMIN || !user.schoolId) {
    return `school_erp/platform/${category}`;
  }
  return `school_erp/${user.schoolId.toString()}/${category}`;
};

/**
 * Handle generic multi-purpose multipart file upload.
 * POST /api/v1/uploads
 */
export const uploadGeneralFile = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw AppError.badRequest('Missing file payload');
    }

    const folder = resolveTenantFolder(req.user, 'general');
    const isImage = req.file.mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    const result = await uploadFile({
      file: req.file.buffer,
      folder,
      resourceType,
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        name: req.file.originalname,
        url: result.secureUrl || result.url,
        secureUrl: result.secureUrl,
        fileType: req.file.mimetype,
        sizeBytes: req.file.size || result.bytes,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user avatar image upload (2 MB limit, images only).
 * POST /api/v1/uploads/avatar
 */
export const uploadAvatarFile = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw AppError.badRequest('Missing avatar image payload');
    }

    const folder = resolveTenantFolder(req.user, 'avatars');

    const result = await uploadFile({
      file: req.file.buffer,
      folder,
      resourceType: 'image',
    });

    res.status(201).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        name: req.file.originalname,
        url: result.secureUrl || result.url,
        secureUrl: result.secureUrl,
        fileType: req.file.mimetype,
        sizeBytes: req.file.size || result.bytes,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle assignment/notice document upload (10 MB limit, documents only).
 * POST /api/v1/uploads/document
 */
export const uploadDocumentFile = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw AppError.badRequest('Missing document payload');
    }

    const folder = resolveTenantFolder(req.user, 'documents');

    const result = await uploadFile({
      file: req.file.buffer,
      folder,
      resourceType: 'raw',
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        name: req.file.originalname,
        url: result.secureUrl || result.url,
        secureUrl: result.secureUrl,
        fileType: req.file.mimetype,
        sizeBytes: req.file.size || result.bytes,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};
