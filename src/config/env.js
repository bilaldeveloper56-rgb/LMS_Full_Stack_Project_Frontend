import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  // Frontend (CORS)
  FRONTEND_URL: z.string().min(1).default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Password hashing
  BCRYPT_SALT_ROUNDS: z.coerce.number().min(10).max(15).default(12),

  // Cookies
  COOKIE_DOMAIN: z.string().default(''),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),

  // Password reset & email verification & invitations
  PASSWORD_RESET_EXPIRES_IN: z.string().default('10m'),
  EMAIL_VERIFICATION_EXPIRES_IN: z.string().default('24h'),
  INVITATION_EXPIRES_IN: z.string().default('7d'),

  // Super Admin Seed Config
  SUPER_ADMIN_EMAIL: z.string().email().default('superadmin@schoolerp.com'),
  SUPER_ADMIN_PASSWORD: z.string().default(''),
  SUPER_ADMIN_FIRST_NAME: z.string().default('Platform'),
  SUPER_ADMIN_LAST_NAME: z.string().default('SuperAdmin'),

  // SMTP (Resend SMTP / standard SMTP — logs to console when unconfigured)
  SMTP_HOST: z.string().default(''),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),
  SMTP_FROM: z.string().default('onboarding@resend.dev'),

  // Cloudinary (optional — used for media/attachment uploads)
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),

  // Redis (optional — distributed rate limiting & ephemeral cache)
  REDIS_URL: z.string().default(''),
  REDIS_HOST: z.string().default(''),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (!data.SUPER_ADMIN_PASSWORD || data.SUPER_ADMIN_PASSWORD.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['SUPER_ADMIN_PASSWORD'],
        message: 'SUPER_ADMIN_PASSWORD is required in production and must be at least 8 characters long',
      });
    }
  } else {
    // In development/test, fallback to development default if not explicitly provided
    if (!data.SUPER_ADMIN_PASSWORD) {
      data.SUPER_ADMIN_PASSWORD = 'SuperAdmin@2026!';
    }
  }
});

export { envSchema };

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsedEnv.error.format(), null, 2)
  );
  process.exit(1);
}

export const env = Object.freeze(parsedEnv.data);

export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
