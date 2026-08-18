import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';
import { connectRedis, disconnectRedis } from './providers/redis.provider.js';
import { initSocketServer, resetSocketServer } from './providers/socket.provider.js';
import app from './app.js';

const startServer = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Connect to Redis (optional — falls back cleanly to memory if unavailable)
  await connectRedis();

  // 3. Start HTTP server
  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
    logger.info(`API docs: http://localhost:${env.PORT}/api-docs`);
    logger.info(`📧 Active Email Provider: [${env.EMAIL_PROVIDER || 'resend'}]`);
    logger.info(`   Host: ${env.SMTP_HOST || '(not configured)'}`);
    logger.info(`   Port: ${env.SMTP_PORT}`);
    logger.info(`   Secure: ${env.SMTP_SECURE}`);
    logger.info(`   From: ${env.SMTP_FROM}`);
    logger.info(`   Auth Configured: ${Boolean(env.SMTP_USER && env.SMTP_PASSWORD)}`);
  });

  // 4. Initialize Socket.io real-time communication
  initSocketServer(server);
  logger.info('⚡ Socket.io real-time server initialized.');

  // --- Graceful Shutdown ---
  let isShuttingDown = false;

  const gracefulShutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.warn(`${signal} received. Starting graceful shutdown...`);

    // Force exit after 25 seconds
    const forceExitTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 25000);
    forceExitTimer.unref();

    try {
      // Stop accepting new connections
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info('HTTP server closed.');

      // Close database connection
      await disconnectDB();

      // Close Redis connection
      await disconnectRedis();

      // Close Socket.io server
      resetSocketServer();

      logger.info('Graceful shutdown completed.');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Signal handlers
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Unhandled errors
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    gracefulShutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
};

startServer();
