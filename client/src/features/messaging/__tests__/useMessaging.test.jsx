import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useConversations,
  useConversationMessages,
  useStartConversation,
  useSendMessage,
} from '../hooks/useMessaging';
import * as msgApi from '../api/messages.api';

vi.mock('../api/messages.api', () => ({
  fetchConversations: vi.fn(),
  fetchConversationMessages: vi.fn(),
  startConversation: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock('@/hooks/useSocket', () => ({
  useSocket: () => ({
    socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    isConnected: true,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

describe('useMessaging React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useConversations and useConversationMessages should fetch data', async () => {
    msgApi.fetchConversations.mockResolvedValue({
      conversations: [{ id: 'c1', title: 'Discussion' }],
      pagination: { page: 1, total: 1 },
    });
    msgApi.fetchConversationMessages.mockResolvedValue({
      messages: [{ id: 'm1', content: 'Hey' }],
      conversation: { id: 'c1' },
      pagination: { page: 1, total: 1 },
    });

    const { result: convHook } = renderHook(() => useConversations(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(convHook.current.isSuccess).toBe(true));
    expect(convHook.current.data.conversations).toHaveLength(1);

    const { result: msgHook } = renderHook(() => useConversationMessages('c1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(msgHook.current.isSuccess).toBe(true));
    expect(msgHook.current.data.messages).toHaveLength(1);
  });

  it('useStartConversation and useSendMessage should trigger mutations', async () => {
    msgApi.startConversation.mockResolvedValue({
      conversation: { id: 'c1' },
      message: { id: 'm1' },
    });
    msgApi.sendMessage.mockResolvedValue({ id: 'm2', content: 'Sure!' });

    const { result: startHook } = renderHook(() => useStartConversation(), {
      wrapper: createWrapper(),
    });
    await startHook.current.mutateAsync({
      recipientUserId: 'u2',
      initialMessage: 'Hello',
    });
    expect(msgApi.startConversation).toHaveBeenCalled();

    const { result: sendHook } = renderHook(() => useSendMessage('c1'), {
      wrapper: createWrapper(),
    });
    await sendHook.current.mutateAsync({ content: 'Sure!' });
    expect(msgApi.sendMessage).toHaveBeenCalledWith('c1', { content: 'Sure!' });
  });
});
