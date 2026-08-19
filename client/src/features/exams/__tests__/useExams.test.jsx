import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useExams,
  useExam,
  useCreateExam,
  usePublishExam,
  useScheduleExamPaper,
} from '../hooks/useExams';
import * as examApi from '../api/exams.api';

vi.mock('../api/exams.api', () => ({
  createExam: vi.fn(),
  fetchExams: vi.fn(),
  fetchExamById: vi.fn(),
  updateExam: vi.fn(),
  deleteExam: vi.fn(),
  publishExam: vi.fn(),
  scheduleExamPaper: vi.fn(),
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

describe('useExams React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useExams and useExam should fetch data', async () => {
    examApi.fetchExams.mockResolvedValue({
      exams: [{ id: 'e1', name: 'Mid Term' }],
      pagination: { page: 1, total: 1 },
    });
    examApi.fetchExamById.mockResolvedValue({ id: 'e1', name: 'Mid Term', papers: [] });

    const { result: listHook } = renderHook(() => useExams(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(listHook.current.isSuccess).toBe(true));
    expect(listHook.current.data.exams).toHaveLength(1);

    const { result: singleHook } = renderHook(() => useExam('e1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(singleHook.current.isSuccess).toBe(true));
    expect(singleHook.current.data.name).toBe('Mid Term');
  });

  it('useCreateExam, usePublishExam, and useScheduleExamPaper should trigger mutations', async () => {
    examApi.createExam.mockResolvedValue({ id: 'e1' });
    examApi.publishExam.mockResolvedValue({ id: 'e1', isPublished: true });
    examApi.scheduleExamPaper.mockResolvedValue({ id: 'p1' });

    const { result: createHook } = renderHook(() => useCreateExam(), {
      wrapper: createWrapper(),
    });
    await createHook.current.mutateAsync({ name: 'New Term' });
    expect(examApi.createExam).toHaveBeenCalled();

    const { result: pubHook } = renderHook(() => usePublishExam(), {
      wrapper: createWrapper(),
    });
    await pubHook.current.mutateAsync('e1');
    expect(examApi.publishExam).toHaveBeenCalledWith('e1');

    const { result: schedHook } = renderHook(() => useScheduleExamPaper('e1'), {
      wrapper: createWrapper(),
    });
    await schedHook.current.mutateAsync({ classId: 'c1' });
    expect(examApi.scheduleExamPaper).toHaveBeenCalledWith('e1', { classId: 'c1' });
  });
});
