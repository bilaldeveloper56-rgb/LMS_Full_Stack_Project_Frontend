import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLE_VALUES, USER_STATUS, USER_STATUS_VALUES } from '../../constants/index.js';
import { env } from '../../config/env.js';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ROLE_VALUES,
        message: 'Invalid role: {VALUE}',
      },
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      enum: {
        values: USER_STATUS_VALUES,
        message: 'Invalid status: {VALUE}',
      },
      default: USER_STATUS.PENDING,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    invitationToken: {
      type: String,
      select: false,
    },
    invitationExpires: {
      type: Date,
      select: false,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    invitedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.passwordHash;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.invitationToken;
        delete ret.invitationExpires;
        delete ret.isDeleted;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.passwordHash;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.invitationToken;
        delete ret.invitationExpires;
        delete ret.isDeleted;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// --- Indexes (Partial Unique: Uniqueness applies only to active/non-deleted users) ---
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
userSchema.index({ schoolId: 1, role: 1 });
userSchema.index({ schoolId: 1, status: 1 });

// --- Exclude soft-deleted from default queries and counts ---
userSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

userSchema.pre('countDocuments', function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// --- Static Methods ---

/**
 * Hash a plaintext password.
 * @param {string} plainPassword
 * @returns {Promise<string>} hashed password
 */
userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
};

// --- Instance Methods ---

/**
 * Compare a candidate password against the stored hash.
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Check if password was changed after a JWT was issued.
 * @param {number} jwtIssuedAt - JWT iat claim (seconds)
 * @returns {boolean}
 */
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedAtSeconds = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return jwtIssuedAt < changedAtSeconds;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
export default User;
