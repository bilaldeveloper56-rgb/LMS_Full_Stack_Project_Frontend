import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/config/api';
import {
  fetchConversations,
  fetchConversationMessages,
  startConversation,
  sendMessage,
} from '../api/messages.api';

vi.mock('@/config/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Messages API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchConversations should call GET /messages/conversations', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversations: [{ id: 'c1', title: 'Teacher Chat' }],
          pagination: { page: 1, total: 1 },
        },
      },
    });

    const result = await fetchConversations({ page: 1 });
    expect(api.get).toHaveBeenCalledWith('/messages/conversations', { params: { page: 1 } });
    expect(result.conversations).toHaveLength(1);
  });

  it('fetchConversationMessages should call GET /messages/conversations/:id', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          messages: [{ id: 'm1', content: 'Hello' }],
        },
        conversation: { id: 'c1' },
        pagination: { page: 1, total: 1 },
      },
    });

    const result = await fetchConversationMessages('c1');
    expect(api.get).toHaveBeenCalledWith('/messages/conversations/c1', { params: {} });
    expect(result.messages).toHaveLength(1);
    expect(result.conversation.id).toBe('c1');
  });

  it('startConversation should call POST /messages/conversations', async () => {
    const payload = { recipientUserId: '507f1f77bcf86cd799439011', initialMessage: 'Hi' };
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversation: { id: 'c1' },
          message: { id: 'm1', content: 'Hi' },
        },
      },
    });

    const result = await startConversation(payload);
    expect(api.post).toHaveBeenCalledWith('/messages/conversations', payload);
    expect(result.conversation.id).toBe('c1');
    expect(result.message.content).toBe('Hi');
  });

  it('sendMessage should call POST /messages/conversations/:id/messages', async () => {
    const payload = { content: 'Reply message' };
    api.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          message: { id: 'm2', content: 'Reply message' },
        },
      },
    });

    const result = await sendMessage('c1', payload);
    expect(api.post).toHaveBeenCalledWith('/messages/conversations/c1/messages', payload);
    expect(result.content).toBe('Reply message');
  });
});
