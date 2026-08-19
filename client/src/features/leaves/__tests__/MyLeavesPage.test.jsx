import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { MyLeavesPage } from '../pages/MyLeavesPage';
import * as leavesApi from '../api/leaves.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/leaves.api', () => ({
  createLeave: vi.fn(),
  fetchLeaves: vi.fn(),
  fetchMyLeaves: vi.fn(),
  fetchStudentLeaves: vi.fn(),
  fetchTeacherLeaves: vi.fn(),
  fetchLeaveById: vi.fn(),
  updateLeave: vi.fn(),
  cancelLeave: vi.fn(),
  approveLeave: vi.fn(),
  rejectLeave: vi.fn(),
  deleteLeave: vi.fn(),
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

describe('MyLeavesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    leavesApi.fetchMyLeaves.mockResolvedValue({
      leaves: [
        {
          _id: 'myLeave1',
          leaveType: 'CASUAL',
          dayType: 'HALF_DAY',
          startDate: '2026-09-15T00:00:00.000Z',
          endDate: '2026-09-15T00:00:00.000Z',
          reason: 'Family appointment',
          status: 'PENDING',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    leavesApi.createLeave.mockResolvedValue({ success: true });
    leavesApi.cancelLeave.mockResolvedValue({ success: true });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.TEACHER,
        permissions: [PERMISSIONS.LEAVES_READ, PERMISSIONS.LEAVES_CREATE],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render personal leave applications and details', async () => {
    renderWithProviders(<MyLeavesPage />);

    expect(await screen.findByText('Family appointment')).toBeInTheDocument();
    expect(screen.getAllByText('Casual Leave').length).toBeGreaterThanOrEqual(1);
  });

  it('should submit a new leave request via application modal', async () => {
    renderWithProviders(<MyLeavesPage />);

    expect(await screen.findByText('Family appointment')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Apply for Leave/i }));
    expect(screen.getByText('Submit Leave Application')).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText(/Describe the reason for leave request in detail/i);
    fireEvent.change(reasonInput, { target: { value: 'Attending dental appointment' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Application/i }));

    await waitFor(() => {
      expect(leavesApi.createLeave).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'Attending dental appointment' })
      );
    });
  });

  it('should cancel pending leave application', async () => {
    renderWithProviders(<MyLeavesPage />);

    expect(await screen.findByText('Family appointment')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.getByText('Confirm Leave Application Cancellation')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Yes, Cancel Application/i }));

    await waitFor(() => {
      expect(leavesApi.cancelLeave).toHaveBeenCalledWith('myLeave1');
    });
  });
});
