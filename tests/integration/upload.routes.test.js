import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env.js';
import { ROLES, USER_STATUS, SCHOOL_STATUS } from '../../src/constants/index.js';
import User from '../../src/modules/users/user.model.js';
import School from '../../src/modules/schools/school.model.js';
import { setCloudinaryClient, resetCloudinaryClient } from '../../src/providers/cloudinary.provider.js';

// Helper to make test HTTP requests
const makeRequest = async (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, async () => {
      const port = server.address().port;
      try {
        const res = await fetch(`http://localhost:${port}${path}`, {
          method,
          headers,
          body,
        });

        const status = res.status;
        const data = await res.json().catch(() => null);
        server.close(() => resolve({ status, data }));
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
};

describe('Upload API Routes Integration Tests', () => {
  const dummyUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'Upload',
    lastName: 'Tester',
    email: 'uploader@school.edu',
    role: ROLES.TEACHER,
    schoolId: '507f1f77bcf86cd799439099',
    status: USER_STATUS.ACTIVE,
    changedPasswordAfter: () => false,
    toJSON: () => ({ id: '507f1f77bcf86cd799439011' }),
  };

  const validToken = jwt.sign(
    { sub: dummyUser._id, role: dummyUser.role, schoolId: dummyUser.schoolId, type: 'access' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  let originalFindByIdUser;
  let originalFindByIdSchool;

  beforeEach(() => {
    originalFindByIdUser = User.findById;
    originalFindByIdSchool = School.findById;

    User.findById = (id) => ({
      select: () => Promise.resolve(dummyUser),
    });

    School.findById = (id) =>
      Promise.resolve({
        _id: '507f1f77bcf86cd799439099',
        status: SCHOOL_STATUS.ACTIVE,
      });

    // Inject mock Cloudinary client so integration tests are fast and deterministic
    setCloudinaryClient({
      uploader: {
        upload_stream: (options, callback) => {
          return {
            end: (buffer) => {
              callback(null, {
                public_id: `${options.folder || 'school_erp'}/test_uploaded_file`,
                url: 'http://res.cloudinary.com/test/image/upload/test_uploaded_file.jpg',
                secure_url: 'https://res.cloudinary.com/test/image/upload/test_uploaded_file.jpg',
                format: 'jpg',
                bytes: buffer ? buffer.length : 1024,
                resource_type: options.resource_type || 'image',
                created_at: new Date().toISOString(),
              });
            },
          };
        },
      },
    });
  });

  afterEach(() => {
    User.findById = originalFindByIdUser;
    School.findById = originalFindByIdSchool;
    resetCloudinaryClient();
  });

  it('should reject unauthenticated upload requests with 401', async () => {
    const res = await makeRequest('POST', '/api/v1/uploads');
    assert.equal(res.status, 401);
  });

  it('should reject upload requests with invalid JWT with 401', async () => {
    const res = await makeRequest('POST', '/api/v1/uploads', null, {
      Authorization: 'Bearer invalid-token',
    });
    assert.equal(res.status, 401);
  });

  it('should reject request missing file payload with 400', async () => {
    const formData = new FormData();
    formData.append('unrelatedField', 'some-value');

    const res = await makeRequest('POST', '/api/v1/uploads', formData, {
      Authorization: `Bearer ${validToken}`,
    });

    assert.equal(res.status, 400);
    assert.ok(res.data.message.includes('Missing file payload') || res.data.message.includes('Unexpected field'));
  });

  it('should successfully upload an approved image file with 201 Created', async () => {
    const formData = new FormData();
    const dummyImageBlob = new Blob(['dummy image binary data'], { type: 'image/png' });
    formData.append('file', dummyImageBlob, 'profile_pic.png');

    const res = await makeRequest('POST', '/api/v1/uploads', formData, {
      Authorization: `Bearer ${validToken}`,
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.name, 'profile_pic.png');
    assert.equal(res.data.data.fileType, 'image/png');
    assert.ok(res.data.data.secureUrl);
    assert.ok(res.data.data.publicId);
  });

  it('should successfully upload an avatar via POST /api/v1/uploads/avatar', async () => {
    const formData = new FormData();
    const dummyImageBlob = new Blob(['avatar binary content'], { type: 'image/jpeg' });
    formData.append('avatar', dummyImageBlob, 'teacher_avatar.jpg');

    const res = await makeRequest('POST', '/api/v1/uploads/avatar', formData, {
      Authorization: `Bearer ${validToken}`,
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.name, 'teacher_avatar.jpg');
    assert.equal(res.data.data.fileType, 'image/jpeg');
  });

  it('should successfully upload a PDF document via POST /api/v1/uploads/document', async () => {
    const formData = new FormData();
    const dummyDocBlob = new Blob(['%PDF-1.4 sample document content'], { type: 'application/pdf' });
    formData.append('document', dummyDocBlob, 'assignment_instructions.pdf');

    const res = await makeRequest('POST', '/api/v1/uploads/document', formData, {
      Authorization: `Bearer ${validToken}`,
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.name, 'assignment_instructions.pdf');
    assert.equal(res.data.data.fileType, 'application/pdf');
  });

  it('should reject SVG uploads with 400 Bad Request for security', async () => {
    const formData = new FormData();
    const svgBlob = new Blob(['<svg><script>alert("xss")</script></svg>'], { type: 'image/svg+xml' });
    formData.append('file', svgBlob, 'malicious.svg');

    const res = await makeRequest('POST', '/api/v1/uploads', formData, {
      Authorization: `Bearer ${validToken}`,
    });

    assert.equal(res.status, 400);
    assert.ok(res.data.message.includes('not permitted') || res.data.message.includes('Invalid') || res.data.message.includes('Unsupported'));
  });

  it('should reject dangerous executable files with 400 Bad Request', async () => {
    const formData = new FormData();
    const exeBlob = new Blob(['MZ binary payload'], { type: 'application/x-msdownload' });
    formData.append('file', exeBlob, 'malware.exe');

    const res = await makeRequest('POST', '/api/v1/uploads', formData, {
      Authorization: `Bearer ${validToken}`,
    });

    assert.equal(res.status, 400);
  });
});
