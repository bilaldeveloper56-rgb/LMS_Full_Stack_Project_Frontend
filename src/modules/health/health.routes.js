import { Router } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';
import { isRedisConfigured, getRedisClient } from '../../providers/redis.provider.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Basic health check
 *     description: Returns server status, uptime, and timestamp
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/health', asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  
  const redisConfigured = isRedisConfigured();
  const redisClient = getRedisClient();
  const redisStatus = redisClient && (redisClient.status === 'ready' || redisClient.status === 'connect')
    ? 'connected'
    : (redisConfigured ? 'disconnected (fallback_to_memory)' : 'disabled (memory_store)');

  sendSuccess(res, 200, 'Server is healthy', {
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    redis: redisStatus,
    memoryUsage: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
    },
  });
}));

/**
 * @swagger
 * /health/redis:
 *   get:
 *     tags: [Health]
 *     summary: Redis health check
 *     description: Returns Redis connection status
 *     responses:
 *       200:
 *         description: Redis status returned
 */
router.get('/health/redis', asyncHandler(async (req, res) => {
  const redisConfigured = isRedisConfigured();
  const redisClient = getRedisClient();
  const isConnected = Boolean(redisClient && (redisClient.status === 'ready' || redisClient.status === 'connect'));

  sendSuccess(res, 200, isConnected ? 'Redis is connected' : (redisConfigured ? 'Redis is disconnected (using in-memory store)' : 'Redis is disabled (using in-memory store)'), {
    status: isConnected ? 'ok' : 'fallback',
    configured: redisConfigured,
    connected: isConnected,
    mode: isConnected ? 'distributed' : 'in_memory',
  });
}));

/**
 * @swagger
 * /health/db:
 *   get:
 *     tags: [Health]
 *     summary: Database health check
 *     description: Returns MongoDB connection status
 *     responses:
 *       200:
 *         description: Database is connected
 *       503:
 *         description: Database is not connected
 */
router.get('/health/db', asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1;

  // Ping the database to verify actual connectivity
  if (isHealthy) {
    try {
      await mongoose.connection.db.admin().ping();
    } catch {
      return sendSuccess(res, 503, 'Database ping failed', {
        status: 'unhealthy',
        database: 'ping_failed',
      });
    }
  }

  const statusCode = isHealthy ? 200 : 503;
  sendSuccess(res, statusCode, isHealthy ? 'Database is healthy' : 'Database is not connected', {
    status: isHealthy ? 'ok' : 'unhealthy',
    database: states[dbState] || 'unknown',
  });
}));

export default router;
