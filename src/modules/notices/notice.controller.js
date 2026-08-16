import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as noticeService from './notice.service.js';
import { createNoticeSchema, updateNoticeSchema, queryNoticeSchema } from './notice.validator.js';

export const createNotice = asyncHandler(async (req, res) => {
  const validated = createNoticeSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const notice = await noticeService.createNotice(validated, req.user, meta);
  return sendCreated(res, 'Notice created successfully', { notice });
});

export const publishNotice = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const notice = await noticeService.publishNotice(req.params.id, req.user, meta);
  return sendSuccess(res, 200, 'Notice published successfully', { notice });
});

export const getNotices = asyncHandler(async (req, res) => {
  const validated = queryNoticeSchema.parse(req.query);
  const result = await noticeService.getNotices(validated, req.user);
  return sendPaginated(res, 'Notices retrieved successfully', result.notices, result.pagination);
});

export const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await noticeService.getNoticeById(req.params.id, req.user);
  return sendSuccess(res, 200, 'Notice retrieved successfully', { notice });
});

export const updateNotice = asyncHandler(async (req, res) => {
  const validated = updateNoticeSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const notice = await noticeService.updateNotice(req.params.id, validated, req.user, meta);
  return sendSuccess(res, 200, 'Notice updated successfully', { notice });
});

export const deleteNotice = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await noticeService.deleteNotice(req.params.id, req.user, meta);
  return sendSuccess(res, 200, result.message);
});
