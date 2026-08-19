import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { LeavesDirectoryPage } from '../pages/LeavesDirectoryPage';
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

describe('LeavesDirectoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    leavesApi.fetchLeaves.mockResolvedValue({
      leaves: [
        {
          _id: 'leave1',
          applicantUserId: { firstName: 'Sarah', lastName: 'Connor', email: 'sarah@test.com' },
          leaveType: 'SICK',
          dayType: 'FULL_DAY',
          startDate: '2026-09-10T00:00:00.000Z',
          endDate: '2026-09-12T00:00:00.000Z',
          reason: 'Viral fever',
          status: 'PENDING',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    leavesApi.approveLeave.mockResolvedValue({ success: true });
    leavesApi.rejectLeave.mockResolvedValue({ success: true });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'adm',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.LEAVES_READ,
          PERMISSIONS.LEAVES_CREATE,
          PERMISSIONS.LEAVES_APPROVE,
          PERMISSIONS.LEAVES_REJECT,
          PERMISSIONS.LEAVES_DELETE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render leave requests table and details', async () => {
    renderWithProviders(<LeavesDirectoryPage />);

    expect(await screen.findByText('Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText('Viral fever')).toBeInTheDocument();
  });

  it('should approve leave application via decision modal', async () => {
    renderWithProviders(<LeavesDirectoryPage />);

    expect(await screen.findByText('Sarah Connor')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Approve leave for Sarah Connor/i }));
    expect(screen.getByText('Approve Leave Request')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm Approval/i }));

    await waitFor(() => {
      expect(leavesApi.approveLeave).toHaveBeenCalledWith('leave1');
    });
  });

  it('should reject leave application with rejection reason', async () => {
    renderWithProviders(<LeavesDirectoryPage />);

    expect(await screen.findByText('Sarah Connor')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reject leave for Sarah Connor/i }));
    expect(screen.getByText('Reject Leave Request')).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText(/Explain why this leave application is being rejected/i);
    fireEvent.change(reasonInput, { target: { value: 'Staff shortage on requested dates' } });

    fireEvent.click(screen.getByRole('button', { name: /Confirm Rejection/i }));

    await waitFor(() => {
      expect(leavesApi.rejectLeave).toHaveBeenCalledWith('leave1', {
        rejectionReason: 'Staff shortage on requested dates',
      });
    });
  });
});
