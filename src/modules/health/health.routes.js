import { Router } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseHelper.js';

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
  sendSuccess(res, 200, 'Server is healthy', {
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memoryUsage: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
    },
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
