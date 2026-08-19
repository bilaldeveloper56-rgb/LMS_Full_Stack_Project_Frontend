import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '../DashboardPage';
import * as authContextModule from '@/features/auth/auth.context';
import * as dashboardApi from '@/features/dashboard/api/dashboard.api';
import { ROLES } from '@/constants';

vi.mock('@/features/dashboard/api/dashboard.api', () => ({
  fetchSchoolAnalytics: vi.fn(),
  fetchPlatformAnalytics: vi.fn(),
}));

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('DashboardPage Central Dispatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render SuperAdminDashboard when user is SUPER_ADMIN', async () => {
    dashboardApi.fetchPlatformAnalytics.mockResolvedValueOnce({
      schools: { totalSchools: 5, ACTIVE: 4, PENDING: 1, SUSPENDED: 0 },
      users: { totalUsers: 300 },
      systemActivity: { totalAuditEvents: 1500 },
    });

    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'sa', role: ROLES.SUPER_ADMIN, firstName: 'Root' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Platform Administration')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
  });

  it('should render SchoolAdminDashboard when user is SCHOOL_ADMIN', async () => {
    dashboardApi.fetchSchoolAnalytics.mockResolvedValueOnce({
      demographics: { totalStudents: 200, activeStudents: 190 },
      academicStructure: { totalTeachers: 15 },
      attendance: { attendanceRatePercentage: 95 },
      financials: { totalInvoiced: 100000, totalPaid: 90000 },
      academic: { passRatePercentage: 88 },
    });

    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'adm', role: ROLES.SCHOOL_ADMIN, firstName: 'Principal' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Institutional Dashboard')).toBeInTheDocument();
    expect(screen.getByText('School Admin')).toBeInTheDocument();
  });

  it('should render AccountantDashboard when user is ACCOUNTANT', async () => {
    dashboardApi.fetchSchoolAnalytics.mockResolvedValueOnce({
      financials: { totalInvoiced: 75000, totalPaid: 60000, totalBalance: 15000 },
    });

    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'acc', role: ROLES.ACCOUNTANT, firstName: 'Finance' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Financial & Accounts Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Accountant')).toBeInTheDocument();
  });

  it('should render TeacherDashboard when user is TEACHER', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 't1', role: ROLES.TEACHER, firstName: 'Sarah', lastName: 'Connor' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/Welcome back, Sarah Connor/i)).toBeInTheDocument();
    expect(screen.getByText('Teaching Workspace')).toBeInTheDocument();
  });

  it('should render StudentDashboard when user is STUDENT', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 's1', role: ROLES.STUDENT, firstName: 'Alex' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/Welcome, Alex/i)).toBeInTheDocument();
    expect(screen.getByText('Student Learning Center')).toBeInTheDocument();
  });

  it('should render ParentDashboard when user is PARENT', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'p1', role: ROLES.PARENT, firstName: 'Martha' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/Welcome, Martha/i)).toBeInTheDocument();
    expect(screen.getByText('Family Academic Overview')).toBeInTheDocument();
  });

  it('should render LibrarianDashboard when user is LIBRARIAN', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'l1', role: ROLES.LIBRARIAN, firstName: 'Booker' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/Welcome, Booker/i)).toBeInTheDocument();
    expect(screen.getByText('Library Operations')).toBeInTheDocument();
  });

  it('should render StaffDashboard when user is STAFF', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'st1', role: ROLES.STAFF, firstName: 'Officer' },
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/Welcome, Officer/i)).toBeInTheDocument();
    expect(screen.getByText('Staff Workspace')).toBeInTheDocument();
  });

  it('should render loading skeleton while auth is loading', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByLabelText(/Loading dashboard metrics/i)).toBeInTheDocument();
  });
});
