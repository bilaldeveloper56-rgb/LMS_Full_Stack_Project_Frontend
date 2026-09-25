import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../../src/app.js';

describe('Health Check Endpoints Integration Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  const request = async (path, headers = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers,
    });
    const status = res.status;
    const data = await res.json().catch(() => null);
    return { status, data, headers: res.headers };
  };

  it('GET /health should return 200 OK with lightweight status payload', async () => {
    const start = performance.now();
    const res = await request('/health');
    const duration = performance.now() - start;

    assert.equal(res.status, 200);
    assert.ok(res.data);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.status, 'ok');
    assert.equal(typeof res.data.data.uptime, 'number');
    assert.ok(res.data.data.timestamp);
    assert.ok(res.data.data.database);
    assert.ok(res.data.data.redis);
    assert.ok(res.data.data.memoryUsage);

    // Endpoint execution over local HTTP should be very fast
    assert.ok(duration < 1000, `Expected duration to be fast, got ${duration}ms`);
  });

  it('GET /health should require NO authentication, cookies, or tenant headers', async () => {
    // Calling with empty headers must succeed without 401 or 403
    const res = await request('/health', {});
    assert.equal(res.status, 200);
    assert.equal(res.data.data.status, 'ok');
  });

  it('GET /health should expose NO credentials, secrets, or sensitive configuration', async () => {
    const res = await request('/health');
    const rawString = JSON.stringify(res.data);

    // Verify no secret variables are leaked
    assert.equal(rawString.includes('mongodb+srv'), false);
    assert.equal(rawString.includes('rediss://'), false);
    assert.equal(rawString.includes('password'), false);
    assert.equal(rawString.includes('secret'), false);
    assert.equal(rawString.includes('JWT'), false);
    assert.equal(rawString.includes('RESEND'), false);
    assert.equal(rawString.includes('CLOUDINARY'), false);
  });

  it('GET /health/redis should return 200 OK with Redis diagnostic status', async () => {
    const res = await request('/health/redis');
    assert.equal(res.status, 200);
    assert.ok(res.data);
    assert.ok(['ok', 'fallback'].includes(res.data.data.status));
    assert.ok(['distributed', 'in_memory'].includes(res.data.data.mode));
  });

  it('GET /health/db should return valid database diagnostic response', async () => {
    const res = await request('/health/db');
    // Depending on connection state, status is 200 (connected) or 503 (disconnected)
    assert.ok([200, 503].includes(res.status));
    assert.ok(res.data);
    assert.ok(['ok', 'unhealthy'].includes(res.data.data.status));
  });

  it('GET /health should be mounted outside /api rate-limiter path', async () => {
    // Fire 5 rapid requests to ensure no rate limiting
    const requests = Array.from({ length: 5 }, () => request('/health'));
    const results = await Promise.all(requests);
    for (const r of results) {
      assert.equal(r.status, 200);
      assert.equal(r.data.data.status, 'ok');
    }
  });
});
