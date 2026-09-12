import { describe, it, expect } from 'vitest';
import {
  getTenantSubdomain,
  isPlatformHost,
  isReservedSubdomain,
  slugify,
  SLUG_REGEX,
} from '../tenant';

describe('Frontend Tenant Subdomain Utility Tests', () => {
  it('should extract school subdomain from production hostname', () => {
    expect(getTenantSubdomain('bright-future.lmsprime.online')).toBe('bright-future');
    expect(getTenantSubdomain('city-school.lmsprime.online')).toBe('city-school');
    expect(getTenantSubdomain('abc-school-123.lmsprime.online')).toBe('abc-school-123');
  });

  it('should return null for platform hosts and reserved domains', () => {
    expect(getTenantSubdomain('app.lmsprime.online')).toBe(null);
    expect(getTenantSubdomain('www.lmsprime.online')).toBe(null);
    expect(getTenantSubdomain('api.lmsprime.online')).toBe(null);
    expect(getTenantSubdomain('admin.lmsprime.online')).toBe(null);
    expect(getTenantSubdomain('lmsprime.online')).toBe(null);
    expect(getTenantSubdomain('localhost')).toBe(null);
    expect(getTenantSubdomain('127.0.0.1')).toBe(null);
  });

  it('should resolve local dev subdomain or query parameter fallback', () => {
    // Subdomain on localhost
    expect(getTenantSubdomain('bright-future.localhost')).toBe('bright-future');

    // Query parameter on localhost
    expect(getTenantSubdomain('localhost', '?tenant=bright-future')).toBe('bright-future');
    expect(getTenantSubdomain('127.0.0.1', '?tenant=city-school')).toBe('city-school');

    // Reserved in query param
    expect(getTenantSubdomain('localhost', '?tenant=app')).toBe(null);
  });

  it('should check platform host correctly', () => {
    expect(isPlatformHost('app.lmsprime.online')).toBe(true);
    expect(isPlatformHost('lmsprime.online')).toBe(true);
    expect(isPlatformHost('localhost')).toBe(true);
    expect(isPlatformHost('bright-future.lmsprime.online')).toBe(false);
  });

  it('should identify reserved subdomains', () => {
    expect(isReservedSubdomain('app')).toBe(true);
    expect(isReservedSubdomain('admin')).toBe(true);
    expect(isReservedSubdomain('support')).toBe(true);
    expect(isReservedSubdomain('bright-future')).toBe(false);
  });

  it('should slugify school names properly', () => {
    expect(slugify('Bright Future School')).toBe('bright-future-school');
    expect(slugify('City School 2026')).toBe('city-school-2026');
    expect(slugify('  St. John\'s High Academy  ')).toBe('st-johns-high-academy');
  });

  it('should validate slug format with SLUG_REGEX', () => {
    expect(SLUG_REGEX.test('bright-future')).toBe(true);
    expect(SLUG_REGEX.test('Bright-Future')).toBe(false);
    expect(SLUG_REGEX.test('bright_future')).toBe(false);
    expect(SLUG_REGEX.test('-bright-future')).toBe(false);
    expect(SLUG_REGEX.test('bright--future')).toBe(false);
  });
});
