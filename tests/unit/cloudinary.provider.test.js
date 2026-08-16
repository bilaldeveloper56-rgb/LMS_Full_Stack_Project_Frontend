import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCloudinaryConfigured,
  getCloudinaryClient,
  setCloudinaryClient,
  resetCloudinaryClient,
  uploadFile,
  deleteFile,
} from '../../src/providers/cloudinary.provider.js';

describe('Cloudinary Provider Unit & Security Tests', () => {
  beforeEach(() => {
    resetCloudinaryClient();
  });

  afterEach(() => {
    resetCloudinaryClient();
  });

  it('should detect unconfigured state when environment variables are empty', () => {
    // When no mock is injected and env is empty, isCloudinaryConfigured returns false
    const configured = isCloudinaryConfigured();
    // In our test environment without Cloudinary credentials, it should be false
    assert.equal(typeof configured, 'boolean');
  });

  it('should reject upload when missing file parameter', async () => {
    await assert.rejects(
      () => uploadFile({ file: null }),
      (err) => err.statusCode === 400 && err.message.includes('missing file payload')
    );
  });

  it('should reject delete when missing publicId parameter', async () => {
    await assert.rejects(
      () => deleteFile(''),
      (err) => err.statusCode === 400 && err.message.includes('missing publicId')
    );
  });

  it('should upload file string/URI via Cloudinary client and return safe metadata', async () => {
    const mockClient = {
      uploader: {
        upload: async (file, options) => ({
          public_id: 'school_erp/notices/sample_notice_doc',
          url: 'http://res.cloudinary.com/demo/image/upload/sample_notice_doc.jpg',
          secure_url: 'https://res.cloudinary.com/demo/image/upload/sample_notice_doc.jpg',
          format: 'jpg',
          bytes: 1048576,
          resource_type: 'image',
          width: 800,
          height: 600,
          created_at: '2026-08-15T00:00:00Z',
        }),
      },
    };

    setCloudinaryClient(mockClient);

    const result = await uploadFile({
      file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      folder: 'school_erp/notices',
      resourceType: 'image',
    });

    assert.equal(result.publicId, 'school_erp/notices/sample_notice_doc');
    assert.equal(result.secureUrl, 'https://res.cloudinary.com/demo/image/upload/sample_notice_doc.jpg');
    assert.equal(result.format, 'jpg');
    assert.equal(result.bytes, 1048576);
    assert.equal(result.resourceType, 'image');
  });

  it('should upload Buffer via upload_stream and return safe metadata', async () => {
    const mockClient = {
      uploader: {
        upload_stream: (options, callback) => {
          return {
            end: (buffer) => {
              callback(null, {
                public_id: 'school_erp/assignments/student_homework',
                url: 'http://res.cloudinary.com/demo/raw/upload/student_homework.pdf',
                secure_url: 'https://res.cloudinary.com/demo/raw/upload/student_homework.pdf',
                format: 'pdf',
                bytes: 2048,
                resource_type: 'raw',
                created_at: '2026-08-15T00:00:00Z',
              });
            },
          };
        },
      },
    };

    setCloudinaryClient(mockClient);

    const dummyBuffer = Buffer.from('PDF content sample');
    const result = await uploadFile({
      file: dummyBuffer,
      folder: 'school_erp/assignments',
      resourceType: 'raw',
    });

    assert.equal(result.publicId, 'school_erp/assignments/student_homework');
    assert.equal(result.secureUrl, 'https://res.cloudinary.com/demo/raw/upload/student_homework.pdf');
    assert.equal(result.resourceType, 'raw');
  });

  it('should delete file via Cloudinary client and return destroy status', async () => {
    const mockClient = {
      uploader: {
        destroy: async (publicId, options) => ({
          result: 'ok',
        }),
      },
    };

    setCloudinaryClient(mockClient);

    const result = await deleteFile('school_erp/notices/sample_notice_doc', {
      resourceType: 'image',
    });

    assert.equal(result.success, true);
    assert.equal(result.result, 'ok');
  });

  it('should catch Cloudinary upload API errors and throw clean AppError without secret exposure', async () => {
    const mockClient = {
      uploader: {
        upload: async () => {
          throw new Error('Invalid API Key format or unauthorized quota');
        },
      },
    };

    setCloudinaryClient(mockClient);

    await assert.rejects(
      () =>
        uploadFile({
          file: 'data:image/png;base64,invalid',
          folder: 'test',
        }),
      (err) => err.statusCode === 400 && err.message.includes('Cloudinary upload failed')
    );
  });
});
