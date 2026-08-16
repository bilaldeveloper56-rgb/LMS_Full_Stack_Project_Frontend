import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    familyId: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedByTokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RefreshToken',
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes ---
refreshTokenSchema.index({ tokenHash: 1 });
refreshTokenSchema.index({ userId: 1, familyId: 1 });
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// --- Instance Methods ---
refreshTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

refreshTokenSchema.methods.isRevoked = function () {
  return this.revokedAt !== null;
};

refreshTokenSchema.methods.isValid = function () {
  return !this.isExpired() && !this.isRevoked();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
