import { HTTP_STATUS } from '../constants/index.js';

export const sendSuccess = (res, statusCode = HTTP_STATUS.OK, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendCreated = (res, message, data = null) => {
  return sendSuccess(res, HTTP_STATUS.CREATED, message, data);
};

export const sendNoContent = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

export const sendPaginated = (res, message, data, pagination) => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages
    }
  });
};
