import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { AcademicSessionsPage } from '../pages/AcademicSessionsPage';
import * as academicsApi from '../api/academics.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/academics.api', () => ({
  fetchAcademicSessions: vi.fn(),
  fetchAcademicSessionById: vi.fn(),
  createAcademicSession: vi.fn(),
  updateAcademicSession: vi.fn(),
  changeAcademicSessionStatus: vi.fn(),
  setAcademicSessionCurrent: vi.fn(),
  deleteAcademicSession: vi.fn(),
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

describe('AcademicSessionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'adm',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.ACADEMIC_SESSIONS_READ,
          PERMISSIONS.ACADEMIC_SESSIONS_CREATE,
          PERMISSIONS.ACADEMIC_SESSIONS_MANAGE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render academic sessions list with active badge', async () => {
    const mockSessions = [
      {
        _id: 'ses1',
        name: '2026-2027 Academic Year',
        startDate: '2026-08-01',
        endDate: '2027-06-30',
        status: 'ACTIVE',
        isCurrent: true,
      },
    ];

    academicsApi.fetchAcademicSessions.mockResolvedValueOnce({
      sessions: mockSessions,
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderWithProviders(<AcademicSessionsPage />);

    expect(await screen.findByText('2026-2027 Academic Year')).toBeInTheDocument();
    expect(screen.getAllByText('Current Session').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('New Academic Session')).toBeInTheDocument();
  });

  it('should open create modal on button click', async () => {
    academicsApi.fetchAcademicSessions.mockResolvedValueOnce({
      sessions: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    renderWithProviders(<AcademicSessionsPage />);

    const createBtn = await screen.findByRole('button', { name: /Create Academic Session/i });
    fireEvent.click(createBtn);

    expect(screen.getByText('Session Lifecycle Status *')).toBeInTheDocument();
  });
});
