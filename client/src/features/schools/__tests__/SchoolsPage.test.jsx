import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { SchoolsPage } from '../pages/SchoolsPage';
import * as schoolsApi from '../api/schools.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/schools.api', () => ({
  fetchSchools: vi.fn(),
  fetchSchoolStats: vi.fn(),
  fetchSchoolById: vi.fn(),
  fetchMySchool: vi.fn(),
  createSchool: vi.fn(),
  updateSchool: vi.fn(),
  changeSchoolStatus: vi.fn(),
  resendAdminInvitation: vi.fn(),
  deleteSchool: vi.fn(),
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

describe('SchoolsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.SUPER_ADMIN,
        permissions: [
          PERMISSIONS.SCHOOLS_READ,
          PERMISSIONS.SCHOOLS_CREATE,
          PERMISSIONS.SCHOOLS_UPDATE,
          PERMISSIONS.SCHOOLS_DELETE,
          PERMISSIONS.SCHOOLS_MANAGE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    schoolsApi.fetchSchoolStats.mockResolvedValue({
      total: 12,
      active: 10,
      pending: 1,
      suspended: 1,
    });

    schoolsApi.fetchSchools.mockResolvedValue({
      schools: [
        {
          _id: 's1',
          id: 's1',
          name: 'Springfield High Academy',
          schoolCode: 'SPH-01',
          email: 'contact@springfield.edu',
          phone: '555-1234',
          city: 'Springfield',
          country: 'US',
          status: 'ACTIVE',
          createdAt: '2026-01-10T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it('should render multi-tenant schools directory, stats, and school rows', async () => {
    renderWithProviders(<SchoolsPage />);

    expect(await screen.findByText('SaaS Tenant Schools Management')).toBeInTheDocument();
    expect(await screen.findByText('Springfield High Academy')).toBeInTheDocument();
    expect(screen.getByText('SPH-01')).toBeInTheDocument();
    expect(screen.getByText('contact@springfield.edu')).toBeInTheDocument();
    expect(screen.getByText('Provision New School')).toBeInTheDocument();

    const changeStatusBtn = screen.getByRole('button', { name: /Change School Status/i });
    fireEvent.click(changeStatusBtn);

    expect(await screen.findByText('Change School Lifecycle Status')).toBeInTheDocument();
  });

  it('should open delete confirmation modal when Delete button is clicked', async () => {
    renderWithProviders(<SchoolsPage />);

    const deleteBtn = await screen.findByRole('button', { name: /Delete School/i });
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);

    expect(await screen.findByText('Confirm School Deletion')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete school/i)).toBeInTheDocument();
  });
});
