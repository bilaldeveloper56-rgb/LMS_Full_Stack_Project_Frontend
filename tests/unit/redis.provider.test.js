import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  isRedisConfigured,
  getRedisClient,
  setRedisClient,
  resetRedisClient,
  connectRedis,
  disconnectRedis,
  createRateLimitStore,
} from '../../src/providers/redis.provider.js';

describe('Redis Provider Unit & Integration Tests', () => {
  beforeEach(() => {
    resetRedisClient();
  });

  afterEach(async () => {
    await disconnectRedis();
    resetRedisClient();
  });

  it('should detect Redis configuration status as boolean', () => {
    const configured = isRedisConfigured();
    assert.equal(typeof configured, 'boolean');
  });

  it('should return null client when explicitly disabled (fallback/test mode)', () => {
    setRedisClient(false);
    const client = getRedisClient();
    assert.equal(client, null);
    assert.equal(isRedisConfigured(), false);
  });

  it('should return undefined store when Redis is explicitly disabled', () => {
    setRedisClient(false);
    const store = createRateLimitStore('rl:test:');
    assert.equal(store, undefined);
  });

  it('should create a valid rate limit store with an active Redis client', () => {
    const mockClient = {
      call: async (command, ...args) => {
        if (command === 'SCRIPT') return 'sample_sha';
        return 1;
      },
      on: () => {},
      status: 'ready',
    };

    setRedisClient(mockClient);

    const store = createRateLimitStore('rl:test:');
    assert.ok(store);
    assert.equal(typeof store.increment, 'function');
  });

  it('should safely handle connectRedis when client fails or is not connected', async () => {
    const mockClient = {
      status: 'wait',
      connect: async () => {
        throw new Error('Connection refused to redis:6379');
      },
      on: () => {},
    };

    setRedisClient(mockClient);

    const connected = await connectRedis();
    assert.equal(connected, false);
  });

  it('should gracefully disconnect without throwing errors', async () => {
    let quitCalled = false;
    const mockClient = {
      status: 'ready',
      quit: async () => {
        quitCalled = true;
      },
      disconnect: () => {},
      on: () => {},
    };

    setRedisClient(mockClient);
    await disconnectRedis();
    assert.equal(quitCalled, true);
  });

  it('should handle disconnect safely when no client is initialized', async () => {
    setRedisClient(false);
    await assert.doesNotReject(async () => {
      await disconnectRedis();
    });
  });
});
