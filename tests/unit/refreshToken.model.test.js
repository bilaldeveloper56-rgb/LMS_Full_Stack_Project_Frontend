import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import RefreshToken from '../../src/modules/auth/refreshToken.model.js';

describe('RefreshToken Model Unit Tests', () => {
  const dummyUserId = new mongoose.Types.ObjectId();

  it('should correctly identify valid active tokens', () => {
    const token = new RefreshToken({
      userId: dummyUserId,
      tokenHash: 'samplehash123',
      familyId: 'family-uuid-1',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // expires in 1 hour
      revokedAt: null,
    });

    assert.equal(token.isExpired(), false);
    assert.equal(token.isRevoked(), false);
    assert.equal(token.isValid(), true);
  });

  it('should correctly detect expired tokens (Requirement 10: Expired refresh token)', () => {
    const token = new RefreshToken({
      userId: dummyUserId,
      tokenHash: 'samplehash123',
      familyId: 'family-uuid-1',
      expiresAt: new Date(Date.now() - 1000 * 60), // expired 1 minute ago
      revokedAt: null,
    });

    assert.equal(token.isExpired(), true);
    assert.equal(token.isValid(), false);
  });

  it('should correctly detect revoked tokens (Requirement 11: Revoked refresh token)', () => {
    const token = new RefreshToken({
      userId: dummyUserId,
      tokenHash: 'samplehash123',
      familyId: 'family-uuid-1',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      revokedAt: new Date(), // revoked
    });

    assert.equal(token.isRevoked(), true);
    assert.equal(token.isValid(), false);
  });
});
