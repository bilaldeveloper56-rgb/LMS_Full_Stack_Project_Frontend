import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { SubjectsPage } from '../pages/SubjectsPage';
import * as academicsApi from '../api/academics.api';
import * as teachersApi from '@/features/teachers/api/teachers.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/academics.api', () => ({
  fetchAcademicSessions: vi.fn(() => Promise.resolve({ sessions: [] })),
  fetchClasses: vi.fn(() => Promise.resolve({ classes: [] })),
  fetchSections: vi.fn(() => Promise.resolve({ sections: [] })),
  fetchSubjects: vi.fn(() =>
    Promise.resolve({
      subjects: [{ _id: 'sub1', name: 'Chemistry', code: 'CHEM-101', subjectType: 'CORE', isActive: true }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    })
  ),
  fetchSubjectById: vi.fn(() => Promise.resolve({})),
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
  fetchTeacherAssignments: vi.fn(() =>
    Promise.resolve({
      assignments: [
        {
          _id: 'a1',
          teacherId: { firstName: 'Dmitri', lastName: 'Mendeleev' },
          subjectId: { name: 'Chemistry', code: 'CHEM-101' },
          classId: { name: 'Grade 11' },
          sectionId: { name: 'B' },
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    })
  ),
  createTeacherAssignment: vi.fn(),
  deleteTeacherAssignment: vi.fn(),
}));

vi.mock('@/features/teachers/api/teachers.api', () => ({
  fetchTeachers: vi.fn(() => Promise.resolve({ teachers: [] })),
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

describe('SubjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'adm',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.SUBJECTS_READ,
          PERMISSIONS.SUBJECTS_CREATE,
          PERMISSIONS.TEACHERS_MANAGE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render subjects catalog and switch to allocations tab', async () => {
    renderWithProviders(<SubjectsPage />);

    expect(await screen.findByText('Chemistry')).toBeInTheDocument();
    expect(screen.getByText('CHEM-101')).toBeInTheDocument();
    expect(screen.getByText('New Subject')).toBeInTheDocument();

    // Switch to allocations tab
    fireEvent.click(screen.getByRole('tab', { name: /Faculty Allocations/i }));
    expect(await screen.findByText('Dmitri Mendeleev')).toBeInTheDocument();
    expect(screen.getByText('Grade 11 (B)')).toBeInTheDocument();
  });
});
