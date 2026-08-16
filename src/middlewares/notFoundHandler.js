import AppError from '../utils/AppError.js';

const notFoundHandler = (req, res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

export default notFoundHandler;
