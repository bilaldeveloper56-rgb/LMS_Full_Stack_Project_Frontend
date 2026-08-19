import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { StudentDetailsPage } from '../pages/StudentDetailsPage';
import * as studentsApi from '../api/students.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/students.api', () => ({
  fetchStudentProfile: vi.fn(),
  fetchStudentAcademic: vi.fn(),
  deleteStudent: vi.fn(),
}));

const renderWithProviders = (initialEntry = '/students/s1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/students/:id" element={<StudentDetailsPage />} />
            <Route path="/students" element={<div>Students Directory List</div>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('StudentDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'adm', role: ROLES.SCHOOL_ADMIN, permissions: [PERMISSIONS.STUDENTS_READ, PERMISSIONS.STUDENTS_UPDATE, PERMISSIONS.STUDENTS_DELETE] },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render student profile, details, tabs, and action buttons', async () => {
    const mockProfile = {
      id: 's1',
      admissionNumber: 'ADM-007',
      firstName: 'James',
      lastName: 'Bond',
      gender: 'MALE',
      dateOfBirth: '2010-04-13',
      enrollmentStatus: 'ACTIVE',
      bloodGroup: 'A+',
      email: 'jbond@school.edu',
      phone: '555-007',
      emergencyContactName: 'M',
      emergencyContactPhone: '555-999',
      classId: { name: 'Grade 11' },
      sectionId: { name: 'Alpha' },
      academicSessionId: { name: '2026-2027' },
      parents: [
        {
          relationshipType: 'FATHER',
          isPrimary: true,
          parent: { firstName: 'Andrew', lastName: 'Bond', email: 'andrew@mail.com', phone: '555-111' },
        },
      ],
    };

    const mockAcademic = {
      enrollments: [
        {
          _id: 'enr1',
          academicSessionId: { name: '2026-2027', isCurrent: true },
          classId: { name: 'Grade 11' },
          sectionId: { name: 'Alpha' },
          rollNumber: '07',
          enrollmentStatus: 'ACTIVE',
          enrolledAt: '2026-01-01',
        },
      ],
      currentSubjects: [
        {
          subjectId: { name: 'Mathematics', code: 'MATH-101', subjectType: 'CORE' },
          teacherId: { firstName: 'Alan', lastName: 'Turing', email: 'turing@school.edu' },
        },
      ],
    };

    studentsApi.fetchStudentProfile.mockResolvedValueOnce(mockProfile);
    studentsApi.fetchStudentAcademic.mockResolvedValueOnce(mockAcademic);

    renderWithProviders('/students/s1');

    expect(await screen.findByRole('heading', { level: 1, name: /James Bond/i })).toBeInTheDocument();
    expect(screen.getByText('ADM-007')).toBeInTheDocument();
    expect(screen.getByText('Grade 11 (Alpha)')).toBeInTheDocument();
    expect(screen.getByText('Andrew Bond')).toBeInTheDocument();
    expect(screen.getByText('Edit Student')).toBeInTheDocument();
    expect(screen.getByText('Deactivate')).toBeInTheDocument();

    // Switch to Academic tab
    fireEvent.click(screen.getByRole('tab', { name: /Academic & Subjects/i }));
    expect(await screen.findByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText(/Alan Turing/i)).toBeInTheDocument();

    // Switch to Enrollment History tab
    fireEvent.click(screen.getByRole('tab', { name: /Enrollment History/i }));
    expect(await screen.findByRole('heading', { name: /Enrollment History/i })).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('should open delete modal and call deleteStudent on confirm', async () => {
    const mockProfile = {
      id: 's1',
      admissionNumber: 'ADM-007',
      firstName: 'James',
      lastName: 'Bond',
      enrollmentStatus: 'ACTIVE',
    };

    studentsApi.fetchStudentProfile.mockResolvedValueOnce(mockProfile);
    studentsApi.fetchStudentAcademic.mockResolvedValueOnce({ enrollments: [], currentSubjects: [] });
    studentsApi.deleteStudent.mockResolvedValueOnce({ success: true, message: 'Deleted' });

    renderWithProviders('/students/s1');

    expect(await screen.findByRole('heading', { level: 1, name: /James Bond/i })).toBeInTheDocument();

    const deactivateBtn = screen.getByRole('button', { name: /Deactivate/i });
    fireEvent.click(deactivateBtn);

    expect(screen.getByText('Confirm Student Deactivation')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Confirm Deactivation/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(studentsApi.deleteStudent).toHaveBeenCalledWith('s1');
      expect(screen.getByText('Students Directory List')).toBeInTheDocument();
    });
  });
});
