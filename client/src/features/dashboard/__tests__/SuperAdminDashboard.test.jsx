import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuperAdminDashboard } from '../pages/SuperAdminDashboard';
import * as dashboardApi from '../api/dashboard.api';

vi.mock('../api/dashboard.api', () => ({
  fetchPlatformAnalytics: vi.fn(),
  fetchSchoolAnalytics: vi.fn(),
}));

const renderWithQuery = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('SuperAdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render platform metric cards with real data', async () => {
    const mockPlatformData = {
      schools: {
        totalSchools: 12,
        ACTIVE: 10,
        PENDING: 2,
        SUSPENDED: 0,
        INACTIVE: 0,
      },
      users: {
        totalUsers: 1500,
        SUPER_ADMIN: 3,
        SCHOOL_ADMIN: 14,
        TEACHER: 85,
        STUDENT: 900,
        PARENT: 500,
        ACCOUNTANT: 0,
        LIBRARIAN: 0,
        STAFF: 0,
      },
      systemActivity: {
        totalAuditEvents: 4200,
      },
    };

    dashboardApi.fetchPlatformAnalytics.mockResolvedValueOnce(mockPlatformData);

    renderWithQuery(<SuperAdminDashboard />);

    expect(await screen.findByText('12')).toBeInTheDocument(); // Total Schools
    expect(screen.getByText('10')).toBeInTheDocument(); // Active Schools
    expect(screen.getByText('14')).toBeInTheDocument(); // School Admins
    expect(screen.getByText('1,500')).toBeInTheDocument(); // Total Platform Users
    expect(screen.getByText('4,200')).toBeInTheDocument(); // Total Audit Events
    expect(screen.getByText('Platform Administration')).toBeInTheDocument();
  });

  it('should show error state and allow retry on API failure', async () => {
    dashboardApi.fetchPlatformAnalytics.mockRejectedValueOnce(new Error('Network failure'));

    renderWithQuery(<SuperAdminDashboard />);

    expect(await screen.findByText('Failed to load platform analytics')).toBeInTheDocument();
    expect(screen.getByText('Network failure')).toBeInTheDocument();

    // Prepare success response for retry with distinct numbers
    dashboardApi.fetchPlatformAnalytics.mockResolvedValueOnce({
      schools: { totalSchools: 7, ACTIVE: 6, PENDING: 1, SUSPENDED: 0 },
      users: { totalUsers: 200, SUPER_ADMIN: 1 },
      systemActivity: { totalAuditEvents: 50 },
    });

    const retryButton = screen.getByRole('button', { name: /Try again/i });
    fireEvent.click(retryButton);

    expect(await screen.findByText('Institutional Network')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
