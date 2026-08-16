import { logger } from '../config/logger.js';

const requestLogger = (req, res, next) => {
  if (req.path.startsWith('/health')) {
    return next();
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip, headers } = req;
    const { statusCode } = res;
    const userAgent = headers['user-agent'] || '';
    const reqId = req.requestId || 'unknown';

    const logMessage = `${method} ${originalUrl} ${statusCode} ${duration}ms - IP: ${ip} ReqID: ${reqId} UA: ${userAgent}`;

    if (statusCode >= 500) {
      logger.error(logMessage);
    } else if (statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.http(logMessage);
    }
  });

  next();
};

export default requestLogger;
