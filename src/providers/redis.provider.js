import Redis from 'ioredis';
import { RedisStore } from 'rate-limit-redis';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let redisClient = null;
let isExplicitlyDisabled = false;
let isExplicitlyEnabled = false;

/**
 * Helper to determine whether the process is running under the test runner.
 */
const isTestEnvironment = () => {
  return (
    process.env.NODE_ENV === 'test' ||
    env.NODE_ENV === 'test' ||
    process.execArgv.includes('--test') ||
    process.argv.some((a) => typeof a === 'string' && a.includes('test'))
  );
};

/**
 * Check if Redis configuration is provided via environment variables.
 * @param {Object} [options]
 * @param {boolean} [options.force=false] - Force check even in test mode
 * @returns {boolean}
 */
export const isRedisConfigured = ({ force = false } = {}) => {
  if (isExplicitlyDisabled) return false;
  if (redisClient) return true;
  if (isTestEnvironment() && !force && !isExplicitlyEnabled) return false;
  return Boolean(env.REDIS_URL || (env.REDIS_HOST && env.REDIS_PORT));
};

/**
 * Initialize or retrieve the singleton Redis client.
 * In test mode (NODE_ENV === 'test' or running node --test), returns null by default
 * to avoid opening unclosed remote sockets and hitting internet latency during test suites,
 * unless force is specified or a mock/explicit client is set.
 * @param {Object} [options]
 * @param {boolean} [options.force=false] - Force live Redis client creation even in test mode
 * @returns {import('ioredis').Redis | null}
 */
export const getRedisClient = ({ force = false } = {}) => {
  if (isExplicitlyDisabled) return null;
  if (redisClient) return redisClient;

  // In test environment, keep tests fast and isolated in-memory unless explicitly forced
  if (isTestEnvironment() && !force && !isExplicitlyEnabled) {
    return null;
  }

  if (!env.REDIS_URL && !env.REDIS_HOST) {
    return null;
  }

  try {
    const redisOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis reconnection limit reached. Operating in fallback mode.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 1000);
      },
    };

    if (env.REDIS_PASSWORD) {
      redisOptions.password = env.REDIS_PASSWORD;
    }

    if (env.REDIS_URL) {
      redisClient = new Redis(env.REDIS_URL, redisOptions);
    } else {
      redisClient = new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        ...redisOptions,
      });
    }

    // Attach safe event listeners that never leak credentials
    redisClient.on('connect', () => {
      logger.info(`Connected to Redis at ${env.REDIS_HOST || 'URL'}:${env.REDIS_PORT || 'default'}`);
    });

    redisClient.on('error', (err) => {
      logger.warn(`Redis connection error: ${err.message}`);
    });

    return redisClient;
  } catch (error) {
    logger.warn(`Failed to initialize Redis client: ${error.message}`);
    return null;
  }
};

/**
 * Connect to Redis during application startup if configured.
 * @returns {Promise<boolean>}
 */
export const connectRedis = async () => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    if (client.status === 'wait') {
      await client.connect();
    }
    return client.status === 'ready' || client.status === 'connect';
  } catch (err) {
    logger.warn(`Redis startup connection failed: ${err.message}. Falling back to memory store.`);
    return false;
  }
};

/**
 * Gracefully disconnect Redis connection during application shutdown.
 */
export const disconnectRedis = async () => {
  if (!redisClient) return;

  try {
    if (typeof redisClient.quit === 'function') {
      await redisClient.quit();
    } else if (typeof redisClient.disconnect === 'function') {
      redisClient.disconnect();
    }
    logger.info('Redis connection closed gracefully.');
  } catch (err) {
    logger.warn(`Error disconnecting Redis: ${err.message}`);
    if (typeof redisClient.disconnect === 'function') {
      redisClient.disconnect();
    }
  } finally {
    redisClient = null;
  }
};

/**
 * Create a Redis-backed store for express-rate-limit if Redis is available.
 * Returns undefined/null if Redis is unconfigured, allowing express-rate-limit
 * to safely use its default in-memory store.
 * @param {string} [prefix='rl:'] - Key prefix for rate limiting counters
 * @returns {import('express-rate-limit').Store | undefined}
 */
export const createRateLimitStore = (prefix = 'rl:') => {
  const client = getRedisClient();
  if (!client) return undefined;

  try {
    return new RedisStore({
      // Send command using the singleton ioredis client
      sendCommand: (...args) => client.call(...args),
      prefix,
    });
  } catch (err) {
    logger.warn(`Failed to create Redis rate-limit store: ${err.message}. Using default in-memory store.`);
    return undefined;
  }
};

/**
 * Set an injected or mock Redis client (used for testing).
 * @param {Object | null | boolean} client - Injected client or boolean flag
 */
export const setRedisClient = (client) => {
  if (client === false) {
    isExplicitlyDisabled = true;
    isExplicitlyEnabled = false;
    redisClient = null;
  } else if (client === true) {
    isExplicitlyDisabled = false;
    isExplicitlyEnabled = true;
    redisClient = null;
  } else {
    isExplicitlyDisabled = false;
    isExplicitlyEnabled = false;
    redisClient = client;
  }
};

/**
 * Reset Redis client state back to default.
 */
export const resetRedisClient = () => {
  isExplicitlyDisabled = false;
  isExplicitlyEnabled = false;
  redisClient = null;
};
