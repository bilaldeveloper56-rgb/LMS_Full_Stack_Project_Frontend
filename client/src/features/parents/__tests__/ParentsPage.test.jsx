import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { ParentsPage } from '../pages/ParentsPage';
import * as parentsApi from '../api/parents.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/parents.api', () => ({
  fetchParents: vi.fn(),
  fetchParentById: vi.fn(),
  fetchParentChildren: vi.fn(),
  createParent: vi.fn(),
  updateParent: vi.fn(),
  deleteParent: vi.fn(),
  linkStudentParent: vi.fn(),
  unlinkStudentParent: vi.fn(),
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

describe('ParentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'adm', role: ROLES.SCHOOL_ADMIN, permissions: [PERMISSIONS.PARENTS_CREATE, PERMISSIONS.PARENTS_READ] },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render parent directory records', async () => {
    const mockParents = [
      {
        _id: 'p1',
        firstName: 'Helen',
        lastName: 'Parr',
        email: 'elastigirl@super.org',
        phone: '555-1234',
        relationship: 'MOTHER',
        occupation: 'Superhero / Homemaker',
      },
    ];

    parentsApi.fetchParents.mockResolvedValueOnce({
      parents: mockParents,
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderWithProviders(<ParentsPage />);

    expect(await screen.findByText('Helen Parr')).toBeInTheDocument();
    expect(screen.getByText('555-1234')).toBeInTheDocument();
    expect(screen.getByText('Register Parent')).toBeInTheDocument();
  });

  it('should render empty state when no parents exist', async () => {
    parentsApi.fetchParents.mockResolvedValueOnce({
      parents: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    renderWithProviders(<ParentsPage />);

    expect(await screen.findByText('No Parents Registered')).toBeInTheDocument();
  });
});
