import winston from 'winston';
import { env, isDev } from './env.js';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (stack) {
    msg += `\n${stack}`;
  }
  const metadataKeys = Object.keys(metadata);
  if (metadataKeys.length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const removeSecrets = winston.format((info) => {
  const secrets = ['password', 'secret', 'token', 'authorization', 'cookie', 'apikey'];
  const clone = { ...info };
  
  for (const key of Object.keys(clone)) {
    if (secrets.includes(key.toLowerCase())) {
      clone[key] = '***';
    }
  }
  return clone;
});

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    removeSecrets(),
    errors({ stack: true }),
    isDev 
      ? combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat)
      : combine(timestamp(), json())
  ),
  transports: [
    new winston.transports.Console()
  ]
});
