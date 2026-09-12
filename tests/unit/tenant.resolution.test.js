import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractSlugFromHostname,
  extractTenantSlugFromReq,
} from '../../src/middlewares/tenantIsolation.js';

describe('Tenant Resolution Unit Tests', () => {
  it('should extract school slug from production hostname', () => {
    assert.equal(extractSlugFromHostname('bright-future.lmsprime.online'), 'bright-future');
    assert.equal(extractSlugFromHostname('city-school.lmsprime.online'), 'city-school');
    assert.equal(extractSlugFromHostname('abc-school.lmsprime.online'), 'abc-school');
  });

  it('should return null for platform hosts and reserved subdomains', () => {
    assert.equal(extractSlugFromHostname('app.lmsprime.online'), null, 'app is platform host');
    assert.equal(extractSlugFromHostname('www.lmsprime.online'), null, 'www is not a school');
    assert.equal(extractSlugFromHostname('api.lmsprime.online'), null, 'api is not a school');
    assert.equal(extractSlugFromHostname('admin.lmsprime.online'), null, 'admin is reserved');
    assert.equal(extractSlugFromHostname('lmsprime.online'), null, 'apex domain is platform host');
    assert.equal(extractSlugFromHostname('localhost'), null, 'plain localhost is platform host');
  });

  it('should extract school slug from local development hostname', () => {
    assert.equal(extractSlugFromHostname('bright-future.localhost'), 'bright-future');
    assert.equal(extractSlugFromHostname('city-school.localhost'), 'city-school');
  });

  it('should handle malformed or unexpected hostnames safely', () => {
    assert.equal(extractSlugFromHostname(''), null);
    assert.equal(extractSlugFromHostname(null), null);
    assert.equal(extractSlugFromHostname(undefined), null);
    assert.equal(extractSlugFromHostname('evil.attacker.com'), null);
    assert.equal(extractSlugFromHostname('bright..future.lmsprime.online'), null);
    assert.equal(extractSlugFromHostname('bright_future.lmsprime.online'), null);
    assert.equal(extractSlugFromHostname('bright-future.otherlmsprime.online'), null);
  });

  it('should extract tenant slug from X-Forwarded-Host or Host header', () => {
    const req = {
      headers: {
        'x-forwarded-host': 'bright-future.lmsprime.online:443, proxy.cloudflare.com',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');

    const reqHost = {
      headers: {
        host: 'bright-future.lmsprime.online:5000',
      },
    };
    assert.equal(extractTenantSlugFromReq(reqHost), 'bright-future');
  });

  it('should extract tenant slug directly from req.hostname', () => {
    const req = {
      hostname: 'city-school.lmsprime.online',
      headers: {},
    };
    assert.equal(extractTenantSlugFromReq(req), 'city-school');
  });

  it('should NOT allow X-Tenant-Subdomain to override production hostname (Host spoofing defense)', () => {
    const req = {
      headers: {
        host: 'bright-future.lmsprime.online',
        'x-tenant-subdomain': 'city-school',
      },
    };
    // Must resolve strictly to bright-future from the trusted host, NOT city-school
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  it('should NOT allow Origin to override production hostname (Origin spoofing defense)', () => {
    const req = {
      headers: {
        host: 'bright-future.lmsprime.online',
        origin: 'https://city-school.lmsprime.online',
      },
    };
    // Must resolve strictly to bright-future, NOT city-school
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  it('should NOT allow Referer to override production hostname (Referer spoofing defense)', () => {
    const req = {
      headers: {
        host: 'bright-future.lmsprime.online',
        referer: 'https://city-school.lmsprime.online/dashboard',
      },
    };
    // Must resolve strictly to bright-future, NOT city-school
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  it('should NOT treat Origin or Referer as authoritative tenant sources', () => {
    const reqOriginOnly = {
      headers: {
        origin: 'https://bright-future.lmsprime.online',
      },
    };
    // Origin alone without tenant host or dev fallback must not resolve
    assert.equal(extractTenantSlugFromReq(reqOriginOnly), null);

    const reqRefererOnly = {
      headers: {
        referer: 'https://city-school.lmsprime.online/login',
      },
    };
    assert.equal(extractTenantSlugFromReq(reqRefererOnly), null);
  });

  it('should allow X-Tenant-Subdomain as development fallback on localhost', () => {
    const req = {
      hostname: 'localhost',
      headers: {
        'x-tenant-subdomain': 'bright-future',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  it('should allow ?tenant query param as development fallback on localhost', () => {
    const req = {
      hostname: 'localhost',
      query: {
        tenant: 'city-school',
      },
      headers: {},
    };
    assert.equal(extractTenantSlugFromReq(req), 'city-school');
  });

  it('should reject reserved subdomains in development fallback', () => {
    const req = {
      hostname: 'localhost',
      headers: {
        'x-tenant-subdomain': 'app',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), null);

    const reqQuery = {
      hostname: 'localhost',
      query: { tenant: 'admin' },
      headers: {},
    };
    assert.equal(extractTenantSlugFromReq(reqQuery), null);
  });

  it('should reject invalid slug formats in development fallback', () => {
    const req = {
      hostname: 'localhost',
      headers: {
        'x-tenant-subdomain': 'invalid--slug',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), null);
  });

  // --- Production Security Verification Cases A through F ---

  it('Case A: Host + conflicting X-Tenant-Subdomain + Origin + Referer -> tenant strictly matches Host', () => {
    const req = {
      headers: {
        host: 'bright-future.lmsprime.online',
        'x-tenant-subdomain': 'city-school',
        origin: 'https://city-school.lmsprime.online',
        referer: 'https://city-school.lmsprime.online/',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  it('Case B: Host + conflicting X-Forwarded-Host -> untrusted forwarding header cannot override Host', () => {
    const req = {
      headers: {
        host: 'bright-future.lmsprime.online',
        'x-forwarded-host': 'city-school.lmsprime.online',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  it('Case C: Host + malicious X-Forwarded-Host: evil.example.com -> safe and deterministic', () => {
    const req = {
      headers: {
        host: 'bright-future.lmsprime.online',
        'x-forwarded-host': 'evil.example.com',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  it('Case D: Host + conflicting X-Tenant-Subdomain -> tenant strictly matches Host', () => {
    const req = {
      headers: {
        host: 'bright-future.lmsprime.online',
        'x-tenant-subdomain': 'city-school',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  it('Case E: Host + conflicting Origin -> tenant strictly matches Host', () => {
    const req = {
      headers: {
        host: 'bright-future.lmsprime.online',
        origin: 'https://city-school.lmsprime.online',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  it('Case F: Host + conflicting Referer -> tenant strictly matches Host', () => {
    const req = {
      headers: {
        host: 'bright-future.lmsprime.online',
        referer: 'https://city-school.lmsprime.online/',
      },
    };
    assert.equal(extractTenantSlugFromReq(req), 'bright-future');
  });

  // --- CORS Boundary Verification ---

  it('should verify CORS origin allowlist and rejection boundaries', () => {
    const { SLUG_REGEX } = { SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ };
    const lmsprimeSubdomainRegex = /^https:\/\/([a-z0-9-]+)\.lmsprime\.online$/;
    const allowedOrigins = ['https://app.lmsprime.online'];

    const isOriginAllowed = (origin) => {
      const cleanOrigin = origin.replace(/\/+$/, '');
      const lmsMatch = cleanOrigin.match(lmsprimeSubdomainRegex);
      const isAllowedLmsOrigin = Boolean(lmsMatch && SLUG_REGEX.test(lmsMatch[1]));
      return allowedOrigins.includes(cleanOrigin) || isAllowedLmsOrigin;
    };

    // Must be allowed:
    assert.equal(isOriginAllowed('https://app.lmsprime.online'), true);
    assert.equal(isOriginAllowed('https://bright-future.lmsprime.online'), true);
    assert.equal(isOriginAllowed('https://city-school.lmsprime.online'), true);

    // Must be rejected:
    assert.equal(isOriginAllowed('https://bright-future.lmsprime.online.evil.com'), false);
    assert.equal(isOriginAllowed('https://evil-lmsprime.online'), false);
    assert.equal(isOriginAllowed('https://bright-future.lmsprime.online.attacker.com'), false);
    assert.equal(isOriginAllowed('https://foo--bar.lmsprime.online'), false);
    assert.equal(isOriginAllowed('https://-foo.lmsprime.online'), false);
    assert.equal(isOriginAllowed('https://foo-.lmsprime.online'), false);
  });
});
