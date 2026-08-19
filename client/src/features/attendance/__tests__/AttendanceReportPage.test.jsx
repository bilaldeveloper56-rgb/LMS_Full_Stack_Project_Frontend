import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { AttendanceReportPage } from '../pages/AttendanceReportPage';
import * as attendanceApi from '../api/attendance.api';
import * as academicsApi from '@/features/academics/api/academics.api';
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
  fetchClasses: vi.fn().mockResolvedValue({ classes: [] }),
  fetchSections: vi.fn().mockResolvedValue({ sections: [] }),
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

describe('AttendanceReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    attendanceApi.fetchAttendanceList.mockResolvedValue({
      records: [
        {
          _id: 'att1',
          studentId: { firstName: 'Alice', lastName: 'Liddell', admissionNumber: 'ADM-002' },
          classId: { name: 'Grade 10' },
          sectionId: { name: 'Section A' },
          date: '2026-09-01T00:00:00.000Z',
          status: 'PRESENT',
          remarks: 'On time',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    attendanceApi.fetchAttendanceSummaryReport.mockResolvedValue({
      present: 90,
      absent: 5,
      late: 3,
      excused: 2,
      presentPercentage: 90.0,
      total: 100,
    });
    attendanceApi.correctAttendance.mockResolvedValue({ success: true });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'adm',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_UPDATE, PERMISSIONS.ATTENDANCE_DELETE],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render summary statistics and attendance records table', async () => {
    renderWithProviders(<AttendanceReportPage />);

    expect(await screen.findByText('90%')).toBeInTheDocument();
    expect(screen.getByText('Alice Liddell')).toBeInTheDocument();
    expect(screen.getByText('Adm #: ADM-002')).toBeInTheDocument();
  });

  it('should open correction modal and submit correction', async () => {
    renderWithProviders(<AttendanceReportPage />);

    expect(await screen.findByText('Alice Liddell')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Correct attendance for Alice Liddell/i }));
    expect(screen.getByText('Submit Attendance Correction')).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText(/Please describe why this attendance entry/i);
    fireEvent.change(reasonInput, { target: { value: 'Corrected per clinic pass' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Correction/i }));

    await waitFor(() => {
      expect(attendanceApi.correctAttendance).toHaveBeenCalledWith(
        'att1',
        expect.objectContaining({ correctionReason: 'Corrected per clinic pass' })
      );
    });
  });
});
