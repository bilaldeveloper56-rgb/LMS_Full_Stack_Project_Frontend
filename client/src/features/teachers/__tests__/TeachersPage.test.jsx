import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { TeachersPage } from '../pages/TeachersPage';
import * as teachersApi from '../api/teachers.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/teachers.api', () => ({
  fetchTeachers: vi.fn(),
  fetchTeacherById: vi.fn(),
  fetchTeacherAssignments: vi.fn(),
  createTeacher: vi.fn(),
  updateTeacher: vi.fn(),
  deleteTeacher: vi.fn(),
  uploadTeacherAvatar: vi.fn(),
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

describe('TeachersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'adm', role: ROLES.SCHOOL_ADMIN, permissions: [PERMISSIONS.TEACHERS_CREATE, PERMISSIONS.TEACHERS_READ] },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render faculty directory list and action controls', async () => {
    const mockTeachers = [
      {
        _id: 't1',
        employeeId: 'EMP-001',
        firstName: 'Richard',
        lastName: 'Feynman',
        email: 'feynman@school.edu',
        phone: '555-001',
        designation: 'Professor',
        specialization: 'Quantum Mechanics',
        employmentStatus: 'ACTIVE',
      },
    ];

    teachersApi.fetchTeachers.mockResolvedValueOnce({
      teachers: mockTeachers,
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderWithProviders(<TeachersPage />);

    expect(await screen.findByText('EMP-001')).toBeInTheDocument();
    expect(screen.getByText('Richard Feynman')).toBeInTheDocument();
    expect(screen.getByText('Quantum Mechanics')).toBeInTheDocument();
    expect(screen.getByText('Register Teacher')).toBeInTheDocument();
  });

  it('should render empty state when no faculty records exist', async () => {
    teachersApi.fetchTeachers.mockResolvedValueOnce({
      teachers: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    renderWithProviders(<TeachersPage />);

    expect(await screen.findByText('No Teachers Registered')).toBeInTheDocument();
  });

  it('should trigger debounced search on typing', async () => {
    teachersApi.fetchTeachers.mockResolvedValue({
      teachers: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    renderWithProviders(<TeachersPage />);

    const searchInput = screen.getByPlaceholderText(/Search by name, employee ID/i);
    fireEvent.change(searchInput, { target: { value: 'Feynman' } });

    await waitFor(() => {
      expect(teachersApi.fetchTeachers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Feynman' })
      );
    });
  });
});
