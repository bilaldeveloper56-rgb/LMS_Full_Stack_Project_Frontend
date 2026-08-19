import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { NotificationBell } from '../components/NotificationBell';
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

describe('NotificationBell Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notifApi.fetchNotifications.mockResolvedValue({
      notifications: [
        {
          id: 'n1',
          _id: 'n1',
          title: 'Exam Schedule Announced',
          message: 'Final exams timetable has been released.',
          type: 'EXAM',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      pagination: { page: 1, total: 1 },
    });
  });

  it('should render bell trigger with unread badge and open popover on click', async () => {
    renderWithProviders(<NotificationBell />);

    const trigger = screen.getByRole('button', { name: /Notifications/i });
    expect(trigger).toBeInTheDocument();

    // Badge indicates 1 unread
    expect(await screen.findByText('1')).toBeInTheDocument();

    // Click to open popover
    fireEvent.click(trigger);

    expect(await screen.findByText('Exam Schedule Announced')).toBeInTheDocument();
    expect(screen.getByText('Final exams timetable has been released.')).toBeInTheDocument();
    expect(screen.getByText(/View all notifications/i)).toBeInTheDocument();
  });
});
