import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPrimaryFrontendUrl, buildFrontendUrl } from '../../src/utils/urlHelper.js';

describe('URL Helper Unit Tests', () => {
  it('should return default localhost when FRONTEND_URL is default', () => {
    const url = getPrimaryFrontendUrl();
    assert.ok(typeof url === 'string');
    assert.ok(!url.endsWith('/'));
  });

  it('should build clean invitation URL with query parameters', () => {
    const token = 'sample-invitation-token-123';
    const invitationUrl = buildFrontendUrl('/accept-invitation', { token });
    assert.ok(invitationUrl.includes('/accept-invitation?token=sample-invitation-token-123'));
    assert.ok(!invitationUrl.includes('//accept-invitation'));
  });

  it('should build clean login URL without query params', () => {
    const loginUrl = buildFrontendUrl('/login');
    assert.ok(loginUrl.endsWith('/login'));
    assert.ok(!loginUrl.includes('?'));
  });

  it('should build clean password reset URL', () => {
    const resetUrl = buildFrontendUrl('/reset-password', { token: 'xyz789' });
    assert.ok(resetUrl.includes('/reset-password?token=xyz789'));
  });
});
