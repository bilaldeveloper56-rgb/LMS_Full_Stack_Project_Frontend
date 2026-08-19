import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { DailyAttendancePage } from '../pages/DailyAttendancePage';
import * as attendanceApi from '../api/attendance.api';
import * as academicsApi from '@/features/academics/api/academics.api';
import * as studentsApi from '@/features/students/api/students.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/attendance.api', () => ({
  createAttendance: vi.fn(),
  bulkMarkAttendance: vi.fn(),
  fetchAttendanceList: vi.fn(),
  fetchAttendanceById: vi.fn(),
  fetchStudentAttendance: vi.fn(),
  fetchSectionAttendance: vi.fn(),
  fetchClassAttendance: vi.fn(),
  fetchAttendanceSummaryReport: vi.fn(),
  fetchStudentAttendanceReport: vi.fn(),
  fetchSectionAttendanceReport: vi.fn(),
  updateAttendance: vi.fn(),
  correctAttendance: vi.fn(),
  deleteAttendance: vi.fn(),
}));

vi.mock('@/features/academics/api/academics.api', () => ({
  fetchAcademicSessions: vi.fn().mockResolvedValue({
    sessions: [{ _id: '507f1f77bcf86cd799439011', name: '2026-2027', isCurrent: true }],
  }),
  fetchClasses: vi.fn().mockResolvedValue({
    classes: [{ _id: '507f1f77bcf86cd799439012', name: 'Grade 10' }],
  }),
  fetchSections: vi.fn().mockResolvedValue({
    sections: [{ _id: '507f1f77bcf86cd799439013', name: 'Section A' }],
  }),
}));

vi.mock('@/features/students/api/students.api', () => ({
  fetchStudents: vi.fn().mockResolvedValue({
    students: [
      {
        _id: '507f1f77bcf86cd799439014',
        firstName: 'John',
        lastName: 'Doe',
        admissionNumber: 'ADM-001',
      },
    ],
  }),
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

describe('DailyAttendancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    attendanceApi.fetchAttendanceList.mockResolvedValue({ records: [], pagination: {} });
    attendanceApi.bulkMarkAttendance.mockResolvedValue({ success: true });
    academicsApi.fetchAcademicSessions.mockResolvedValue({
      sessions: [{ _id: '507f1f77bcf86cd799439011', name: '2026-2027', isCurrent: true }],
    });
    academicsApi.fetchClasses.mockResolvedValue({
      classes: [{ _id: '507f1f77bcf86cd799439012', name: 'Grade 10' }],
    });
    academicsApi.fetchSections.mockResolvedValue({
      sections: [{ _id: '507f1f77bcf86cd799439013', name: 'Section A' }],
    });
    studentsApi.fetchStudents.mockResolvedValue({
      students: [
        {
          _id: '507f1f77bcf86cd799439014',
          firstName: 'John',
          lastName: 'Doe',
          admissionNumber: 'ADM-001',
        },
      ],
    });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'adm',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_CREATE, PERMISSIONS.ATTENDANCE_REPORT],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render guidance empty state before class and section are selected', async () => {
    renderWithProviders(<DailyAttendancePage />);

    expect(await screen.findByText(/Daily Attendance Roll Call/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Class & Section to Begin Roll Call/i)).toBeInTheDocument();
  });

  it('should render roster sheet when class and section are selected', async () => {
    renderWithProviders(<DailyAttendancePage />);

    // Wait for class option to load
    await screen.findByRole('option', { name: 'Grade 10' });

    // Select Class
    const classSelect = screen.getByRole('combobox', { name: /^Class$/i });
    fireEvent.change(classSelect, { target: { value: '507f1f77bcf86cd799439012' } });

    // Wait for section option to load
    await screen.findByRole('option', { name: 'Section A' });

    const sectionSelect = screen.getByRole('combobox', { name: /^Section$/i });
    fireEvent.change(sectionSelect, { target: { value: '507f1f77bcf86cd799439013' } });

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Save Daily Attendance Sheet')).toBeInTheDocument();
  });
});
