import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useGradingScales,
  useCreateGradingScale,
  useRecordMarks,
  useBulkRecordMarks,
  useStudentReportCard,
  useSectionResults,
  useLockSectionResults,
} from '../hooks/useResults';
import * as resultApi from '../api/results.api';

vi.mock('../api/results.api', () => ({
  createGradingScale: vi.fn(),
  fetchGradingScales: vi.fn(),
  recordMarks: vi.fn(),
  bulkRecordMarks: vi.fn(),
  fetchStudentReportCard: vi.fn(),
  fetchSectionResults: vi.fn(),
  lockSectionResults: vi.fn(),
  unlockSectionResults: vi.fn(),
  publishSectionResults: vi.fn(),
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

describe('useResults React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useGradingScales and useSectionResults should fetch data', async () => {
    resultApi.fetchGradingScales.mockResolvedValue([{ id: 'gs1', name: 'CBSE' }]);
    resultApi.fetchSectionResults.mockResolvedValue([{ id: 'r1', marksObtained: 90 }]);

    const { result: scaleHook } = renderHook(() => useGradingScales(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(scaleHook.current.isSuccess).toBe(true));
    expect(scaleHook.current.data).toHaveLength(1);

    const { result: rosterHook } = renderHook(() => useSectionResults('e1', 'sec1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(rosterHook.current.isSuccess).toBe(true));
    expect(rosterHook.current.data).toHaveLength(1);
  });

  it('useBulkRecordMarks and useLockSectionResults should trigger mutations', async () => {
    resultApi.bulkRecordMarks.mockResolvedValue([{ id: 'r1' }]);
    resultApi.lockSectionResults.mockResolvedValue({ success: true });

    const { result: bulkHook } = renderHook(() => useBulkRecordMarks(), {
      wrapper: createWrapper(),
    });
    await bulkHook.current.mutateAsync({ examId: 'e1', examPaperId: 'p1', records: [] });
    expect(resultApi.bulkRecordMarks).toHaveBeenCalled();

    const { result: lockHook } = renderHook(() => useLockSectionResults(), {
      wrapper: createWrapper(),
    });
    await lockHook.current.mutateAsync({ examId: 'e1', sectionId: 'sec1' });
    expect(resultApi.lockSectionResults).toHaveBeenCalledWith('e1', 'sec1');
  });
});
