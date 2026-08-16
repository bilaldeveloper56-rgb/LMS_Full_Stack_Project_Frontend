import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import AppError from '../utils/AppError.js';

let customCloudinaryClient = null;

/**
 * Check whether Cloudinary credentials are fully configured.
 * @returns {boolean}
 */
export const isCloudinaryConfigured = () => {
  if (customCloudinaryClient) {
    return true;
  }
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );
};

/**
 * Configure and return the Cloudinary v2 client instance.
 * @returns {typeof cloudinary}
 */
export const getCloudinaryClient = () => {
  if (customCloudinaryClient) {
    return customCloudinaryClient;
  }

  if (!isCloudinaryConfigured()) {
    return null;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
};

/**
 * Override or inject a mock Cloudinary client (used for automated testing).
 * @param {Object | null} client
 */
export const setCloudinaryClient = (client) => {
  customCloudinaryClient = client;
};

/**
 * Reset the Cloudinary client back to default configuration.
 */
export const resetCloudinaryClient = () => {
  customCloudinaryClient = null;
};

/**
 * Upload a file (file path, data URI/base64 string, or buffer) to Cloudinary.
 *
 * @param {Object} params
 * @param {string | Buffer} params.file - File path, data URI string, or Buffer
 * @param {string} [params.folder='school_erp'] - Target folder in Cloudinary
 * @param {'auto' | 'image' | 'raw' | 'video'} [params.resourceType='auto'] - Resource type
 * @param {string} [params.publicId] - Optional custom public ID
 * @param {Object} [params.options] - Additional Cloudinary upload options
 * @returns {Promise<{
 *   publicId: string,
 *   url: string,
 *   secureUrl: string,
 *   format: string,
 *   bytes: number,
 *   resourceType: string,
 *   width?: number,
 *   height?: number,
 *   createdAt: string
 * }>}
 */
export const uploadFile = async ({
  file,
  folder = 'school_erp',
  resourceType = 'auto',
  publicId,
  options = {},
}) => {
  if (!file) {
    throw AppError.badRequest('Upload failed: missing file payload');
  }

  const client = getCloudinaryClient();
  if (!client) {
    logger.warn('Cloudinary upload aborted: credentials are not configured');
    throw AppError.internal('Cloudinary storage is not configured on the server');
  }

  try {
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      ...(publicId && { public_id: publicId }),
      ...options,
    };

    let result;

    if (Buffer.isBuffer(file)) {
      // Buffer upload via stream
      result = await new Promise((resolve, reject) => {
        const uploadStream = client.uploader.upload_stream(
          uploadOptions,
          (error, res) => {
            if (error) return reject(error);
            resolve(res);
          }
        );
        uploadStream.end(file);
      });
    } else {
      // File path or Base64 / Data URI string
      result = await client.uploader.upload(file, uploadOptions);
    }

    logger.info(`Cloudinary file uploaded successfully: [${result.public_id}]`, {
      resourceType: result.resource_type,
      bytes: result.bytes,
    });

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      resourceType: result.resource_type,
      width: result.width,
      height: result.height,
      createdAt: result.created_at,
    };
  } catch (error) {
    // Log safe error message without credentials
    logger.error(`Cloudinary upload failed: ${error.message}`);
    throw AppError.badRequest(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete a file from Cloudinary by its public ID.
 *
 * @param {string} publicId - The Cloudinary public ID to delete
 * @param {Object} [options]
 * @param {'image' | 'raw' | 'video'} [options.resourceType='image'] - Resource type
 * @returns {Promise<{ success: boolean, result: string }>}
 */
export const deleteFile = async (publicId, { resourceType = 'image' } = {}) => {
  if (!publicId) {
    throw AppError.badRequest('Cloudinary delete failed: missing publicId');
  }

  const client = getCloudinaryClient();
  if (!client) {
    logger.warn('Cloudinary delete aborted: credentials are not configured');
    throw AppError.internal('Cloudinary storage is not configured on the server');
  }

  try {
    const res = await client.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    logger.info(`Cloudinary file deleted: [${publicId}] - status: ${res.result}`);

    return {
      success: res.result === 'ok' || res.result === 'not found',
      result: res.result,
    };
  } catch (error) {
    logger.error(`Cloudinary delete failed for [${publicId}]: ${error.message}`);
    throw AppError.badRequest(`Cloudinary delete failed: ${error.message}`);
  }
};
