import multer from 'multer';
import path from 'node:path';
import AppError from '../utils/AppError.js';

// --- Allowed MIME types & Extensions ---
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const ALLOWED_DOCUMENT_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);
const ALLOWED_DOCUMENT_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.txt']);

// Blocklist for dangerous file extensions
const BLOCKED_EXTENSIONS = new Set([
  '.svg',
  '.html',
  '.htm',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.php',
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.gz',
]);

/**
 * Configure memory storage so files are held as binary Buffers in memory
 * and streamed directly to Cloudinary without creating unmanaged temporary disk files.
 */
const storage = multer.memoryStorage();

/**
 * Dual validation filter for images: verifies both MIME type and file extension.
 */
const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(
      AppError.badRequest(`File type '${ext}' is not permitted for security reasons`),
      false
    );
  }

  if (ALLOWED_IMAGE_MIMES.has(file.mimetype) && ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return cb(null, true);
  }

  return cb(
    AppError.badRequest(
      `Invalid image type. Allowed formats: JPEG, PNG, WEBP (received MIME: ${file.mimetype}, ext: ${ext})`
    ),
    false
  );
};

/**
 * Dual validation filter for documents: verifies both MIME type and file extension.
 */
const documentFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(
      AppError.badRequest(`File type '${ext}' is not permitted for security reasons`),
      false
    );
  }

  if (ALLOWED_DOCUMENT_MIMES.has(file.mimetype) && ALLOWED_DOCUMENT_EXTENSIONS.has(ext)) {
    return cb(null, true);
  }

  return cb(
    AppError.badRequest(
      `Invalid document type. Allowed formats: PDF, DOC, DOCX, TXT (received MIME: ${file.mimetype}, ext: ${ext})`
    ),
    false
  );
};

/**
 * Dual validation filter for general uploads (allows approved images and documents).
 */
const generalFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(
      AppError.badRequest(`File type '${ext}' is not permitted for security reasons`),
      false
    );
  }

  const isAllowedImage =
    ALLOWED_IMAGE_MIMES.has(file.mimetype) && ALLOWED_IMAGE_EXTENSIONS.has(ext);
  const isAllowedDoc =
    ALLOWED_DOCUMENT_MIMES.has(file.mimetype) && ALLOWED_DOCUMENT_EXTENSIONS.has(ext);

  if (isAllowedImage || isAllowedDoc) {
    return cb(null, true);
  }

  return cb(
    AppError.badRequest(
      `Unsupported file type. Allowed formats: JPG, PNG, WEBP, PDF, DOC, DOCX, TXT (received MIME: ${file.mimetype}, ext: ${ext})`
    ),
    false
  );
};

// --- Multer Instances with Size Limits ---
const uploadAvatarMulter = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2 MB
  fileFilter: imageFileFilter,
});

const uploadDocumentMulter = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10 MB
  fileFilter: documentFileFilter,
});

const uploadGeneralMulter = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10 MB
  fileFilter: generalFileFilter,
});

/**
 * Middleware factory that wraps a Multer single upload call and standardizes errors via AppError.
 *
 * @param {import('multer').Multer} multerInstance
 * @param {string[]} acceptedFields - Array of allowed field names (e.g. ['file', 'avatar'])
 * @param {number} maxBytes - Max allowed file size in bytes for error formatting
 * @returns {import('express').RequestHandler}
 */
const createUploadMiddleware = (multerInstance, acceptedFields, maxBytes) => {
  return (req, res, next) => {
    // Try each accepted field name
    const fieldName = acceptedFields[0] || 'file';
    const uploadSingle = multerInstance.single(fieldName);

    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            const maxMB = Math.round(maxBytes / (1024 * 1024));
            return next(
              AppError.badRequest(`File size exceeds the allowed limit of ${maxMB} MB`)
            );
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(
              AppError.badRequest(
                `Unexpected field '${err.field}'. Expected multipart field '${fieldName}'`
              )
            );
          }
          return next(AppError.badRequest(`Upload error: ${err.message}`));
        }
        return next(err);
      }

      if (!req.file) {
        return next(
          AppError.badRequest(
            `Missing file payload. Please upload a file in the '${fieldName}' field`
          )
        );
      }

      next();
    });
  };
};

export const uploadAvatar = createUploadMiddleware(
  uploadAvatarMulter,
  ['avatar', 'file'],
  2 * 1024 * 1024
);

export const uploadDocument = createUploadMiddleware(
  uploadDocumentMulter,
  ['document', 'file'],
  10 * 1024 * 1024
);

export const uploadGeneral = createUploadMiddleware(
  uploadGeneralMulter,
  ['file', 'document', 'image'],
  10 * 1024 * 1024
);
