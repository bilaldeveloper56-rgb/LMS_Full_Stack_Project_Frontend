import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useStudentRosterReport,
  useAttendanceReport,
  useFeeDefaultersReport,
  useAcademicReportCard,
} from '../hooks/useReports';
import * as reportsApi from '../api/reports.api';

vi.mock('../api/reports.api', () => ({
  fetchStudentRosterReport: vi.fn(),
  fetchAttendanceReport: vi.fn(),
  fetchFeeDefaultersReport: vi.fn(),
  fetchAcademicReportCard: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useReports React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useStudentRosterReport and useAttendanceReport should query endpoints', async () => {
    reportsApi.fetchStudentRosterReport.mockResolvedValue({
      roster: [{ admissionNumber: 'ADM-001' }],
      pagination: { page: 1, total: 1 },
    });
    reportsApi.fetchAttendanceReport.mockResolvedValue({
      reports: [{ attendancePercentage: 95 }],
      pagination: { page: 1, total: 1 },
    });

    const { result: rosterHook } = renderHook(() => useStudentRosterReport({ classId: 'c1' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(rosterHook.current.isSuccess).toBe(true));
    expect(rosterHook.current.data.roster).toHaveLength(1);

    const { result: attHook } = renderHook(() => useAttendanceReport(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(attHook.current.isSuccess).toBe(true));
    expect(attHook.current.data.reports[0].attendancePercentage).toBe(95);
  });

  it('useAcademicReportCard should only execute when studentId is supplied', async () => {
    reportsApi.fetchAcademicReportCard.mockResolvedValue({
      student: { name: 'Alice' },
      performance: { overallStatus: 'PASSED' },
    });

    const { result: disabledHook } = renderHook(() => useAcademicReportCard({ studentId: '' }), {
      wrapper: createWrapper(),
    });
    expect(disabledHook.current.fetchStatus).toBe('idle');

    const { result: enabledHook } = renderHook(() => useAcademicReportCard({ studentId: 'st1' }), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(enabledHook.current.isSuccess).toBe(true));
    expect(enabledHook.current.data.student.name).toBe('Alice');
  });
});
