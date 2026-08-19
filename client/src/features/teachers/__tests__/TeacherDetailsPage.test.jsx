import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { TeacherDetailsPage } from '../pages/TeacherDetailsPage';
import * as teachersApi from '../api/teachers.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/teachers.api', () => ({
  fetchTeacherById: vi.fn(),
  fetchTeacherAssignments: vi.fn(),
  deleteTeacher: vi.fn(),
}));

const renderWithProviders = (initialEntry = '/teachers/t1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/teachers/:id" element={<TeacherDetailsPage />} />
            <Route path="/teachers" element={<div>Teachers Directory List</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('TeacherDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'adm', role: ROLES.SCHOOL_ADMIN, permissions: [PERMISSIONS.TEACHERS_READ, PERMISSIONS.TEACHERS_UPDATE, PERMISSIONS.TEACHERS_DELETE] },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render teacher profile, credentials, and allocations tabs', async () => {
    const mockTeacher = {
      _id: 't1',
      employeeId: 'EMP-001',
      firstName: 'Paul',
      lastName: 'Dirac',
      email: 'dirac@school.edu',
      phone: '555-4321',
      qualification: 'Ph.D. Mathematics',
      specialization: 'Quantum Electrodynamics',
      employmentStatus: 'ACTIVE',
    };

    const mockAssignments = [
      {
        _id: 'a1',
        academicSessionId: { name: '2026-2027' },
        classId: { name: 'Grade 12' },
        sectionId: { name: 'Alpha' },
        subjectId: { name: 'Quantum Physics', code: 'PHYS-301', subjectType: 'CORE' },
      },
    ];

    teachersApi.fetchTeacherById.mockResolvedValueOnce(mockTeacher);
    teachersApi.fetchTeacherAssignments.mockResolvedValueOnce(mockAssignments);

    renderWithProviders('/teachers/t1');

    expect(await screen.findByRole('heading', { level: 1, name: /Paul Dirac/i })).toBeInTheDocument();
    expect(screen.getByText('EMP-001')).toBeInTheDocument();
    expect(screen.getByText('Ph.D. Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Edit Teacher')).toBeInTheDocument();
    expect(screen.getByText('Deactivate')).toBeInTheDocument();

    // Switch to Allocations tab
    fireEvent.click(screen.getByRole('tab', { name: /Class & Subject Allocations/i }));
    expect(await screen.findByText('Quantum Physics')).toBeInTheDocument();
    expect(screen.getByText('Grade 12 (Alpha)')).toBeInTheDocument();
  });

  it('should open delete modal and call deleteTeacher on confirm', async () => {
    const mockTeacher = {
      _id: 't1',
      employeeId: 'EMP-001',
      firstName: 'Paul',
      lastName: 'Dirac',
      employmentStatus: 'ACTIVE',
    };

    teachersApi.fetchTeacherById.mockResolvedValueOnce(mockTeacher);
    teachersApi.fetchTeacherAssignments.mockResolvedValueOnce([]);
    teachersApi.deleteTeacher.mockResolvedValueOnce({ success: true, message: 'Deleted' });

    renderWithProviders('/teachers/t1');

    expect(await screen.findByRole('heading', { level: 1, name: /Paul Dirac/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Deactivate/i }));
    expect(screen.getByText('Confirm Teacher Deactivation')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Confirm Deactivation/i }));

    await waitFor(() => {
      expect(teachersApi.deleteTeacher).toHaveBeenCalledWith('t1');
      expect(screen.getByText('Teachers Directory List')).toBeInTheDocument();
    });
  });
});
