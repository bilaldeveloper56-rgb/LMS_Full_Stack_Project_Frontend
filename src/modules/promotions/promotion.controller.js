import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as promotionService from './promotion.service.js';

export const getPromotionPreview = asyncHandler(async (req, res) => {
  const preview = await promotionService.getPromotionPreview(req.body, req.user);
  sendSuccess(res, 200, 'Promotion preview calculated successfully', preview);
});

export const executeBulkPromotion = asyncHandler(async (req, res) => {
  const meta = { ipAddress: req.ip, userAgent: req.get('user-agent') };
  const result = await promotionService.executeBulkPromotion(req.body, req.user, meta);
  sendCreated(res, `Successfully processed promotion for ${result.totalProcessed} students`, result);
});

export const getPromotionHistory = asyncHandler(async (req, res) => {
  const result = await promotionService.getPromotionHistory(req.query, req.user);
  sendPaginated(res, 'Promotion history retrieved successfully', result.history, result.pagination);
});
