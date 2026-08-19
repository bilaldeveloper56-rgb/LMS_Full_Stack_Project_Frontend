import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import {
  useQuizzes,
  useQuiz,
  useCreateQuiz,
  usePublishQuiz,
  useStartQuizAttempt,
  useSubmitQuizAttempt,
  useGradeQuizAttempt,
} from '../hooks/useQuizzes';
import * as quizzesApi from '../api/quizzes.api';

vi.mock('../api/quizzes.api', () => ({
  createQuiz: vi.fn(),
  fetchQuizzes: vi.fn(),
  fetchQuizById: vi.fn(),
  updateQuiz: vi.fn(),
  deleteQuiz: vi.fn(),
  publishQuiz: vi.fn(),
  startQuizAttempt: vi.fn(),
  submitQuizAttempt: vi.fn(),
  gradeQuizAttempt: vi.fn(),
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

describe('useQuizzes React Query Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useQuizzes should fetch quizzes list', async () => {
    quizzesApi.fetchQuizzes.mockResolvedValue({
      quizzes: [{ id: 'quiz1', title: 'Biology Quiz' }],
      pagination: { page: 1, total: 1 },
    });

    const { result } = renderHook(() => useQuizzes({ page: 1 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.quizzes).toHaveLength(1);
  });

  it('useCreateQuiz and usePublishQuiz should execute mutations', async () => {
    quizzesApi.createQuiz.mockResolvedValue({ id: 'quiz1' });
    quizzesApi.publishQuiz.mockResolvedValue({ id: 'quiz1', status: 'PUBLISHED' });

    const { result: createHook } = renderHook(() => useCreateQuiz(), {
      wrapper: createWrapper(),
    });
    await createHook.current.mutateAsync({ title: 'Bio Quiz' });
    expect(quizzesApi.createQuiz).toHaveBeenCalled();

    const { result: publishHook } = renderHook(() => usePublishQuiz('quiz1'), {
      wrapper: createWrapper(),
    });
    await publishHook.current.mutateAsync();
    expect(quizzesApi.publishQuiz).toHaveBeenCalledWith('quiz1');
  });

  it('useStartQuizAttempt, useSubmitQuizAttempt, and useGradeQuizAttempt should execute mutations', async () => {
    quizzesApi.startQuizAttempt.mockResolvedValue({ id: 'att1', status: 'IN_PROGRESS' });
    quizzesApi.submitQuizAttempt.mockResolvedValue({ id: 'att1', status: 'EVALUATED' });
    quizzesApi.gradeQuizAttempt.mockResolvedValue({ id: 'att1', status: 'EVALUATED', totalScore: 10 });

    const { result: startHook } = renderHook(() => useStartQuizAttempt('quiz1'), {
      wrapper: createWrapper(),
    });
    await startHook.current.mutateAsync();
    expect(quizzesApi.startQuizAttempt).toHaveBeenCalledWith('quiz1');

    const { result: submitHook } = renderHook(() => useSubmitQuizAttempt('quiz1'), {
      wrapper: createWrapper(),
    });
    await submitHook.current.mutateAsync({ attemptId: 'att1', answers: [] });
    expect(quizzesApi.submitQuizAttempt).toHaveBeenCalledWith('att1', { answers: [] });

    const { result: gradeHook } = renderHook(() => useGradeQuizAttempt('quiz1'), {
      wrapper: createWrapper(),
    });
    await gradeHook.current.mutateAsync({ attemptId: 'att1', answers: [] });
    expect(quizzesApi.gradeQuizAttempt).toHaveBeenCalledWith('att1', { answers: [] });
  });
});
