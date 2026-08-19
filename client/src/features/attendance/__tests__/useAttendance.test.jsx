import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useAttendanceList,
  useBulkMarkAttendance,
  useCorrectAttendance,
  useDeleteAttendance,
} from '../hooks/useAttendance';
import * as attendanceApi from '../api/attendance.api';

vi.mock('../api/attendance.api', () => ({
  fetchAttendanceList: vi.fn(),
  fetchAttendanceById: vi.fn(),
  fetchStudentAttendance: vi.fn(),
  fetchSectionAttendance: vi.fn(),
  fetchClassAttendance: vi.fn(),
  fetchAttendanceSummaryReport: vi.fn(),
  fetchStudentAttendanceReport: vi.fn(),
  fetchSectionAttendanceReport: vi.fn(),
  createAttendance: vi.fn(),
  bulkMarkAttendance: vi.fn(),
  updateAttendance: vi.fn(),
  correctAttendance: vi.fn(),
  deleteAttendance: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
};

describe('useAttendance React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useAttendanceList should fetch attendance list', async () => {
    attendanceApi.fetchAttendanceList.mockResolvedValue({
      records: [{ id: 'att1', status: 'PRESENT' }],
      pagination: { page: 1, total: 1 },
    });

    const { result } = renderHook(() => useAttendanceList({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.records).toHaveLength(1);
  });

  it('useBulkMarkAttendance should call bulkMarkAttendance', async () => {
    attendanceApi.bulkMarkAttendance.mockResolvedValue({ count: 5 });
    const { result } = renderHook(() => useBulkMarkAttendance(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ sectionId: 'sec1', records: [] });
    expect(attendanceApi.bulkMarkAttendance).toHaveBeenCalled();
  });

  it('useCorrectAttendance should call correctAttendance', async () => {
    attendanceApi.correctAttendance.mockResolvedValue({ id: 'att1', status: 'EXCUSED' });
    const { result } = renderHook(() => useCorrectAttendance(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 'att1', status: 'EXCUSED', correctionReason: 'Note' });
    expect(attendanceApi.correctAttendance).toHaveBeenCalledWith('att1', {
      status: 'EXCUSED',
      correctionReason: 'Note',
    });
  });
});
