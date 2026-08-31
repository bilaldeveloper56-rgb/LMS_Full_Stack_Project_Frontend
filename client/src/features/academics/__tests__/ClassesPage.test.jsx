import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { ClassesPage } from '../pages/ClassesPage';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../hooks/useAcademics', () => ({
  useClasses: vi.fn(() => ({
    data: {
      classes: [{ _id: 'c1', name: 'Grade 10', code: 'G10', displayOrder: 10, isActive: true }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    isFetching: false,
  })),
  useSections: vi.fn(() => ({
    data: {
      sections: [{ _id: 's1', name: 'Section A', code: 'SEC-A', capacity: 40, classId: { name: 'Grade 10' } }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    isFetching: false,
  })),
  useAcademicSessions: vi.fn(() => ({ data: { sessions: [] }, isLoading: false })),
  useCreateClass: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateClass: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteClass: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useCreateSection: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateSection: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteSection: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock('@/features/teachers', () => ({
  useTeachers: vi.fn(() => ({ data: { teachers: [] }, isLoading: false })),
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

describe('ClassesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'adm',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.CLASSES_READ,
          PERMISSIONS.CLASSES_CREATE,
          PERMISSIONS.SECTIONS_READ,
          PERMISSIONS.SECTIONS_CREATE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render classes list and action controls', async () => {
    renderWithProviders(<ClassesPage />);

    expect(await screen.findByText('Grade 10')).toBeInTheDocument();
    expect(screen.getByText('G10')).toBeInTheDocument();
    expect(screen.getByText('New Class')).toBeInTheDocument();
  });
});
