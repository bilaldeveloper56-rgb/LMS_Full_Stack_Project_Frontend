import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { NoticesPage } from '../pages/NoticesPage';
import * as noticeApi from '../api/notices.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/notices.api', () => ({
  fetchNotices: vi.fn(),
  fetchNoticeById: vi.fn(),
  createNotice: vi.fn(),
  updateNotice: vi.fn(),
  deleteNotice: vi.fn(),
  publishNotice: vi.fn(),
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

describe('NoticesPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.NOTICES_READ,
          PERMISSIONS.NOTICES_CREATE,
          PERMISSIONS.NOTICES_PUBLISH,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    noticeApi.fetchNotices.mockResolvedValue({
      notices: [
        {
          _id: 'n1',
          id: 'n1',
          title: 'Winter Vacation Schedule 2026',
          content: 'School will be closed starting next Monday.',
          priority: 'URGENT',
          targetAudience: 'ALL',
          isPinned: true,
          isPublished: false,
          publishedBy: { firstName: 'Admin', lastName: 'User' },
          createdAt: '2026-10-15T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
    });
  });

  it('should render notice list in grid view and allow publishing draft notice', async () => {
    noticeApi.publishNotice.mockResolvedValue({ _id: 'n1', isPublished: true });

    renderWithProviders(<NoticesPage />);

    expect(await screen.findByText('Notice Board & Bulletins')).toBeInTheDocument();
    expect(await screen.findByText('Winter Vacation Schedule 2026')).toBeInTheDocument();
    expect(screen.getAllByText('Urgent').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Pinned')).toBeInTheDocument();

    const publishBtn = screen.getByRole('button', { name: /Publish Now/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(noticeApi.publishNotice).toHaveBeenCalledWith('n1');
    });
  });
});
