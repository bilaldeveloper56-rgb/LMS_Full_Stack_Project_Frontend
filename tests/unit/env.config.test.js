import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { envSchema } from '../../src/config/env.js';

describe('Environment Config & Security Hardening Unit Tests', () => {
  const baseValidEnv = {
    MONGO_URI: 'mongodb://localhost:27017/test-db',
    JWT_ACCESS_SECRET: '12345678901234567890123456789012',
    JWT_REFRESH_SECRET: '12345678901234567890123456789012',
  };

  it('should allow development mode with fallback default super admin password', () => {
    const parsed = envSchema.parse({
      ...baseValidEnv,
      NODE_ENV: 'development',
    });

    assert.equal(parsed.NODE_ENV, 'development');
    assert.equal(parsed.SUPER_ADMIN_PASSWORD, 'SuperAdmin@2026!');
  });

  it('should allow custom super admin password in development mode', () => {
    const parsed = envSchema.parse({
      ...baseValidEnv,
      NODE_ENV: 'development',
      SUPER_ADMIN_PASSWORD: 'MyDevCustomPassword123!',
    });

    assert.equal(parsed.SUPER_ADMIN_PASSWORD, 'MyDevCustomPassword123!');
  });

  it('should reject production mode when SUPER_ADMIN_PASSWORD is missing or empty', () => {
    const result = envSchema.safeParse({
      ...baseValidEnv,
      NODE_ENV: 'production',
      SUPER_ADMIN_PASSWORD: '',
    });

    assert.equal(result.success, false);
    const issue = result.error.issues.find((i) => i.path.includes('SUPER_ADMIN_PASSWORD'));
    assert.ok(issue);
    assert.ok(issue.message.includes('SUPER_ADMIN_PASSWORD is required in production'));
  });

  it('should reject production mode when SUPER_ADMIN_PASSWORD is shorter than 8 characters', () => {
    const result = envSchema.safeParse({
      ...baseValidEnv,
      NODE_ENV: 'production',
      SUPER_ADMIN_PASSWORD: 'short',
    });

    assert.equal(result.success, false);
    const issue = result.error.issues.find((i) => i.path.includes('SUPER_ADMIN_PASSWORD'));
    assert.ok(issue);
    assert.ok(issue.message.includes('at least 8 characters long'));
  });

  it('should accept production mode when strong SUPER_ADMIN_PASSWORD is provided', () => {
    const result = envSchema.safeParse({
      ...baseValidEnv,
      NODE_ENV: 'production',
      SUPER_ADMIN_PASSWORD: 'ProdSecureSuperAdminPassword@2026!',
    });

    assert.equal(result.success, true);
    assert.equal(result.data.SUPER_ADMIN_PASSWORD, 'ProdSecureSuperAdminPassword@2026!');
  });
});
