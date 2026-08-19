import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../hooks/useNotifications';
import * as notifApi from '../api/notifications.api';

vi.mock('../api/notifications.api', () => ({
  fetchNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));

vi.mock('@/hooks/useSocket', () => ({
  useSocket: () => ({
    socket: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
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

describe('useNotifications React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useNotifications should fetch notifications list and unread count', async () => {
    notifApi.fetchNotifications.mockResolvedValue({
      notifications: [{ id: 'n1', title: 'Quiz Available' }],
      unreadCount: 1,
      pagination: { page: 1, total: 1 },
    });

    const { result } = renderHook(() => useNotifications({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.notifications).toHaveLength(1);
    expect(result.current.data.unreadCount).toBe(1);
  });

  it('useMarkNotificationAsRead and useMarkAllNotificationsAsRead should trigger mutations', async () => {
    notifApi.markNotificationAsRead.mockResolvedValue({ id: 'n1', isRead: true });
    notifApi.markAllNotificationsAsRead.mockResolvedValue({ success: true });

    const { result: readOneHook } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: createWrapper(),
    });
    await readOneHook.current.mutateAsync('n1');
    expect(notifApi.markNotificationAsRead).toHaveBeenCalledWith('n1');

    const { result: readAllHook } = renderHook(() => useMarkAllNotificationsAsRead(), {
      wrapper: createWrapper(),
    });
    await readAllHook.current.mutateAsync();
    expect(notifApi.markAllNotificationsAsRead).toHaveBeenCalled();
  });
});
