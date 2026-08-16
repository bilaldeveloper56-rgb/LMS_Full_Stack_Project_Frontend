import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../utils/responseHelper.js';
import * as messageService from './message.service.js';
import {
  startConversationSchema,
  sendMessageSchema,
  queryConversationSchema,
  queryMessagesSchema,
} from './message.validator.js';

export const startConversation = asyncHandler(async (req, res) => {
  const validated = startConversationSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const result = await messageService.startConversation(validated, req.user, meta);
  return sendCreated(res, 'Conversation started successfully', result);
});

export const getConversations = asyncHandler(async (req, res) => {
  const validated = queryConversationSchema.parse(req.query);
  const result = await messageService.getConversations(validated, req.user);
  return sendPaginated(res, 'Conversations retrieved successfully', result.conversations, result.pagination);
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const validated = queryMessagesSchema.parse(req.query);
  const result = await messageService.getConversationMessages(req.params.id, validated, req.user);
  return sendPaginated(res, 'Messages retrieved successfully', result.messages, result.pagination, {
    conversation: result.conversation,
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const validated = sendMessageSchema.parse(req.body);
  const meta = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
  const message = await messageService.sendMessage(req.params.id, validated, req.user, meta);
  return sendCreated(res, 'Message sent successfully', { message });
});
