import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { StudentsPage } from '../pages/StudentsPage';
import * as studentsApi from '../api/students.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/students.api', () => ({
  fetchStudents: vi.fn(),
  fetchStudentById: vi.fn(),
  fetchStudentProfile: vi.fn(),
  fetchStudentAcademic: vi.fn(),
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
  deleteStudent: vi.fn(),
  uploadStudentAvatar: vi.fn(),
  fetchClasses: vi.fn().mockResolvedValue([]),
  fetchSections: vi.fn().mockResolvedValue([]),
  fetchAcademicSessions: vi.fn().mockResolvedValue([]),
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

describe('StudentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'adm', role: ROLES.SCHOOL_ADMIN, permissions: [PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_READ] },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render student directory list and register button for authorized user', async () => {
    const mockStudents = [
      {
        _id: 's1',
        admissionNumber: 'ADM-101',
        firstName: 'Alice',
        lastName: 'Smith',
        classId: { name: 'Grade 10' },
        sectionId: { name: 'A' },
        rollNumber: '05',
        gender: 'FEMALE',
        enrollmentStatus: 'ACTIVE',
      },
    ];

    studentsApi.fetchStudents.mockResolvedValueOnce({
      students: mockStudents,
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    renderWithProviders(<StudentsPage />);

    expect(await screen.findByText('ADM-101')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Grade 10 (A)')).toBeInTheDocument();
    expect(screen.getByText('Register Student')).toBeInTheDocument();
  });

  it('should render empty state when no students exist', async () => {
    studentsApi.fetchStudents.mockResolvedValueOnce({
      students: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    renderWithProviders(<StudentsPage />);

    expect(await screen.findByText('No Students Registered')).toBeInTheDocument();
  });

  it('should trigger debounced search on input change', async () => {
    studentsApi.fetchStudents.mockResolvedValue({
      students: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    });

    renderWithProviders(<StudentsPage />);

    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    await waitFor(() => {
      expect(studentsApi.fetchStudents).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Alice' })
      );
    });
  });
});
