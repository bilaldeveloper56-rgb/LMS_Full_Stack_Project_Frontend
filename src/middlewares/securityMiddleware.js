import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import express from 'express';
import { env } from '../config/env.js';
import { SLUG_REGEX } from '../constants/index.js';

import { createRateLimitStore } from '../providers/redis.provider.js';

/**
 * Applies security and parsing middleware to the Express application.
 * @param {import('express').Application} app
 */
const applySecurityMiddleware = (app) => {
  // Trust first proxy (Nginx, load balancer, etc.)
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet());

  // CORS - configured origins and verified *.lmsprime.online tenant subdomains
  const allowedOrigins = (env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''));

  const lmsprimeSubdomainRegex = /^https:\/\/([a-z0-9-]+)\.lmsprime\.online$/;
  const localhostSubdomainRegex = /^http:\/\/([a-z0-9-]+)\.localhost(?::\d+)?$/;
  const localhostPlainRegex = /^http:\/\/localhost(?::\d+)?$/;

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }
      const cleanOrigin = origin.replace(/\/+$/, '');

      // Check production *.lmsprime.online origins with strict slug regex
      const lmsMatch = cleanOrigin.match(lmsprimeSubdomainRegex);
      const isAllowedLmsOrigin = Boolean(lmsMatch && SLUG_REGEX.test(lmsMatch[1]));

      // Check dev *.localhost origins
      const localMatch = cleanOrigin.match(localhostSubdomainRegex);
      const isAllowedLocalSubdomain = Boolean(
        env.NODE_ENV !== 'production' && localMatch && SLUG_REGEX.test(localMatch[1])
      );

      if (
        allowedOrigins.includes(cleanOrigin) ||
        allowedOrigins.includes(origin) ||
        isAllowedLmsOrigin ||
        isAllowedLocalSubdomain ||
        (env.NODE_ENV !== 'production' && localhostPlainRegex.test(cleanOrigin))
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Tenant-Subdomain'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400, // 24 hours preflight cache
  }));

  // Body parsing with size limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // NoSQL injection prevention
  app.use(mongoSanitize());

  // Cookie parsing (for refresh token cookies)
  app.use(cookieParser());

  // Response compression
  app.use(compression());

  // Global rate limiter (uses Redis store when configured, falls back to memory)
  const redisStore = createRateLimitStore('rl:global:');
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    ...(redisStore && { store: redisStore }),
    message: {
      success: false,
      message: 'Too many requests, please try again later',
      errors: [],
    },
  });
  app.use('/api', globalLimiter);
};

export default applySecurityMiddleware;
