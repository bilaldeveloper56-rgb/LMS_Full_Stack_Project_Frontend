import AppError from '../utils/AppError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log the full error
  logger.error(err);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for ${field}. Please use another value.`;
    error = new AppError(message, 409);
  }
  // Mongoose CastError
  else if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}.`;
    error = new AppError(message, 400);
  }
  // Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    const message = `Validation error.`;
    error = new AppError(message, 422, errors);
  }
  // ZodError
  else if (err.name === 'ZodError') {
    const errors = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    const message = 'Validation failed';
    error = new AppError(message, 422, errors);
  }
  // SyntaxError from JSON parsing
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new AppError('Invalid JSON payload', 400);
  }
  
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';
  const errors = error.errors || [];
  
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
