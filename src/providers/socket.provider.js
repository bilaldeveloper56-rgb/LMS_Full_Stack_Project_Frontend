import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import User from '../modules/users/user.model.js';
import School from '../modules/schools/school.model.js';
import { USER_STATUS, SCHOOL_STATUS, ROLES } from '../constants/index.js';

let io = null;

/**
 * Extract token from socket handshake (auth object, authorization header, or cookies).
 * @param {import('socket.io').Socket} socket
 * @returns {string|null}
 */
const extractSocketToken = (socket) => {
  if (socket.handshake.auth?.token) {
    const token = socket.handshake.auth.token;
    return token.startsWith('Bearer ') ? token.slice(7) : token;
  }

  const authHeader = socket.handshake.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  if (socket.handshake.headers?.cookie) {
    const cookies = socket.handshake.headers.cookie.split(';');
    for (const cookie of cookies) {
      const [name, val] = cookie.trim().split('=');
      if (name === 'accessToken') {
        return decodeURIComponent(val);
      }
    }
  }

  return null;
};

/**
 * Socket.io Authentication Middleware.
 * Derives user identity exclusively from the verified JWT.
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = extractSocketToken(socket);
    if (!token) {
      return next(new Error('Authentication required: Missing token'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch (err) {
      return next(new Error('Authentication failed: Invalid or expired token'));
    }

    if (decoded.type !== 'access') {
      return next(new Error('Authentication failed: Invalid token type'));
    }

    const user = await User.findById(decoded.sub).select('+passwordChangedAt');
    if (!user) {
      return next(new Error('Authentication failed: User no longer exists'));
    }

    if (
      user.status === USER_STATUS.DISABLED ||
      user.status === USER_STATUS.SUSPENDED ||
      user.status === USER_STATUS.INVITED
    ) {
      return next(new Error('Authentication failed: Account not active'));
    }

    if (user.schoolId && user.role !== ROLES.SUPER_ADMIN) {
      const school = await School.findById(user.schoolId);
      if (!school || school.isDeleted || school.status !== SCHOOL_STATUS.ACTIVE) {
        return next(new Error('Authentication failed: School account not active'));
      }
    }

    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return next(new Error('Authentication failed: Password recently changed'));
    }

    // Attach verified user context to the socket
    socket.user = {
      id: user._id.toString(),
      role: user.role,
      schoolId: user.schoolId ? user.schoolId.toString() : null,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    logger.error('Socket authentication error:', error.message);
    next(new Error('Internal authentication error'));
  }
};

/**
 * Initialize Socket.io server and attach to HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {SocketIOServer}
 */
export const initSocketServer = (httpServer) => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Apply authentication
  io.use(socketAuthMiddleware);

  // Connection Handler
  io.on('connection', (socket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    // Join user-specific isolated room
    const userRoom = `user:${user.id}`;
    socket.join(userRoom);

    // Join school-specific isolated room if applicable
    if (user.schoolId) {
      const schoolRoom = `school:${user.schoolId}`;
      socket.join(schoolRoom);
    }

    logger.info(`⚡ Socket connected: ${socket.id} (User: ${user.id}, Role: ${user.role})`);

    socket.on('disconnect', (reason) => {
      logger.info(`⚡ Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
};

/**
 * Get the active Socket.io instance.
 * @returns {SocketIOServer|null}
 */
export const getIO = () => io;

/**
 * Emit event to a specific user's private room.
 * @param {string} userId
 * @param {string} event
 * @param {any} payload
 */
export const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user:${userId.toString()}`).emit(event, payload);
};

/**
 * Emit event to all users within a specific school/tenant.
 * @param {string} schoolId
 * @param {string} event
 * @param {any} payload
 */
export const emitToSchool = (schoolId, event, payload) => {
  if (!io || !schoolId) return;
  io.to(`school:${schoolId.toString()}`).emit(event, payload);
};

/**
 * Reset socket server instance (used for testing).
 */
export const resetSocketServer = () => {
  if (io) {
    io.close();
    io = null;
  }
};
