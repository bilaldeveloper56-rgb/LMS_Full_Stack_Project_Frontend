import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';
import School from '../modules/schools/school.model.js';
import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { USER_STATUS, SCHOOL_STATUS, ROLES, DEFAULT_ROLE_PERMISSIONS } from '../constants/index.js';

/**
 * Authentication middleware.
 * Extracts JWT from Authorization header, validates it,
 * fetches the user, validates school status, and attaches user context to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Access token required');
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Access token has expired');
      }
      if (err.name === 'JsonWebTokenError') {
        throw AppError.unauthorized('Invalid access token');
      }
      throw AppError.unauthorized('Authentication failed');
    }

    // 3. Verify token type
    if (decoded.type !== 'access') {
      throw AppError.unauthorized('Invalid token type');
    }

    // 4. Find user
    const user = await User.findById(decoded.sub).select('+passwordChangedAt');
    if (!user) {
      throw AppError.unauthorized('User no longer exists');
    }

    // 5. Check user status
    if (user.status === USER_STATUS.DISABLED) {
      throw AppError.forbidden('Account has been disabled');
    }
    if (user.status === USER_STATUS.SUSPENDED) {
      throw AppError.forbidden('Account has been suspended');
    }
    if (user.status === USER_STATUS.INVITED) {
      throw AppError.forbidden('Account setup pending. Please activate your invitation.');
    }

    // 6. Check school status for school-level users (SUPER_ADMIN has schoolId = null and is exempt)
    if (user.schoolId && user.role !== ROLES.SUPER_ADMIN) {
      const school = await School.findById(user.schoolId);
      if (!school || school.isDeleted) {
        throw AppError.forbidden('Associated school account not found');
      }
      if (school.status === SCHOOL_STATUS.INACTIVE) {
        throw AppError.forbidden('School account is inactive');
      }
      if (school.status === SCHOOL_STATUS.SUSPENDED) {
        throw AppError.forbidden('School account is suspended');
      }
    }

    // 7. Check if password changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw AppError.unauthorized('Password recently changed. Please login again.');
    }

    // 7. Attach user context
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
    const customPermissions = Array.isArray(user.permissions) ? user.permissions : [];

    req.user = {
      id: user._id.toString(),
      role: user.role,
      schoolId: user.schoolId ? user.schoolId.toString() : null,
      status: user.status,
      permissions: [...new Set([...rolePermissions, ...customPermissions])],
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
