import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { ReportsPage } from '../pages/ReportsPage';
import * as reportsApi from '../api/reports.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/reports.api', () => ({
  fetchStudentRosterReport: vi.fn(),
  fetchAttendanceReport: vi.fn(),
  fetchFeeDefaultersReport: vi.fn(),
  fetchAcademicReportCard: vi.fn(),
}));

vi.mock('@/features/academics', () => ({
  useAcademicSessions: () => ({ data: [{ _id: 'sess1', name: '2026-2027' }], isLoading: false }),
  useClasses: () => ({ data: [{ _id: 'c1', name: 'Grade 10' }], isLoading: false }),
  useSections: () => ({ data: [{ _id: 's1', name: 'Section A' }], isLoading: false }),
}));

vi.mock('@/features/students', () => ({
  useStudents: () => ({ data: [{ _id: 'st1', firstName: 'Alice', lastName: 'Smith' }], isLoading: false }),
}));

vi.mock('@/features/exams', () => ({
  useExams: () => ({ data: [{ _id: 'e1', name: 'Final Exam' }], isLoading: false }),
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

describe('ReportsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [PERMISSIONS.REPORTS_READ, PERMISSIONS.REPORTS_GENERATE],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    reportsApi.fetchStudentRosterReport.mockResolvedValue({
      roster: [
        {
          studentId: 'st1',
          admissionNumber: 'ADM-2026-001',
          rollNumber: '101',
          firstName: 'Alice',
          lastName: 'Smith',
          class: { name: 'Grade 10' },
          section: { name: 'Section A' },
          gender: 'FEMALE',
          enrollmentStatus: 'ACTIVE',
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });

    reportsApi.fetchAttendanceReport.mockResolvedValue({
      reports: [
        {
          studentId: 'st1',
          admissionNumber: 'ADM-2026-001',
          firstName: 'Alice',
          lastName: 'Smith',
          totalDays: 20,
          presentDays: 19,
          absentDays: 1,
          attendancePercentage: 95,
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });
  });

  it('should render reports page, student roster table, and switch to attendance report tab', async () => {
    renderWithProviders(<ReportsPage />);

    expect(await screen.findByText('Institutional Reports & Exports')).toBeInTheDocument();
    expect(screen.getByText('Student Roster')).toBeInTheDocument();
    expect(screen.getByText('Attendance Register')).toBeInTheDocument();
    expect(screen.getByText('Fee Dues & Defaulters')).toBeInTheDocument();

    // Roster item
    expect(await screen.findByText('ADM-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();

    // Switch to Attendance report
    const attTab = screen.getByText('Attendance Register');
    fireEvent.click(attTab);

    expect(await screen.findByText('95%')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
  });
});
