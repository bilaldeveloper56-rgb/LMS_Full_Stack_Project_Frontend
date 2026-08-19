import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import * as auditApi from '../api/auditLogs.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/auditLogs.api', () => ({
  fetchAuditLogs: vi.fn(),
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

describe('AuditLogsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [PERMISSIONS.AUDIT_LOGS_READ],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    auditApi.fetchAuditLogs.mockResolvedValue({
      logs: [
        {
          _id: 'log-1',
          id: 'log-1',
          event: 'AUTH_LOGIN_SUCCESS',
          entityType: 'User',
          entityId: 'u1',
          userId: 'u1',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          details: { method: 'JWT', status: 'SUCCESS' },
          createdAt: '2026-10-15T12:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });
  });

  it('should render audit ledger table and open inspection details modal on click', async () => {
    renderWithProviders(<AuditLogsPage />);

    expect(await screen.findByText('Security & Compliance Audit Ledger')).toBeInTheDocument();
    expect(await screen.findByText('AUTH_LOGIN_SUCCESS')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();

    const viewBtn = screen.getByRole('button', { name: /View Audit Record Details/i });
    fireEvent.click(viewBtn);

    expect(await screen.findByText('Audit Event Record')).toBeInTheDocument();
    expect(screen.getByText('Mozilla/5.0')).toBeInTheDocument();
    expect(screen.getByText(/Immutable compliance and security ledger snapshot/i)).toBeInTheDocument();
  });

  it('should handle filter reset and empty state properly', async () => {
    auditApi.fetchAuditLogs.mockResolvedValueOnce({
      logs: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 1 },
    });

    renderWithProviders(<AuditLogsPage />);

    expect(await screen.findByText('No audit log records found')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    expect(auditApi.fetchAuditLogs).toHaveBeenCalled();
  });
});
