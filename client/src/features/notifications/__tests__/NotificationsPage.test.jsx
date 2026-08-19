import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { NotificationsPage } from '../pages/NotificationsPage';
import * as notifApi from '../api/notifications.api';

vi.mock('../api/notifications.api', () => ({
  fetchNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));

vi.mock('@/hooks/useSocket', () => ({
  useSocket: () => ({
    socket: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    isConnected: true,
  }),
}));

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('NotificationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notifApi.fetchNotifications.mockResolvedValue({
      notifications: [
        {
          id: 'n1',
          _id: 'n1',
          title: 'Fee Invoice Generated',
          message: 'Term 2 tuition fee invoice is ready.',
          type: 'FEE',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
    });
    notifApi.markAllNotificationsAsRead.mockResolvedValue({ success: true });
  });

  it('should render notifications directory and mark all as read', async () => {
    renderWithProviders(<NotificationsPage />);

    expect(await screen.findByText('Fee Invoice Generated')).toBeInTheDocument();
    expect(screen.getByText('Term 2 tuition fee invoice is ready.')).toBeInTheDocument();

    const markAllBtn = screen.getByRole('button', { name: /Mark All as Read/i });
    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(notifApi.markAllNotificationsAsRead).toHaveBeenCalled();
    });
  });
});
