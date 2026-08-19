import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { TakeQuizPage } from '../pages/TakeQuizPage';
import * as quizzesApi from '../api/quizzes.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

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

const renderWithProviders = (initialEntry = '/quizzes/quiz1/take') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/quizzes/:id/take" element={<TakeQuizPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('TakeQuizPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    quizzesApi.fetchQuizById.mockResolvedValue({
      _id: 'quiz1',
      title: 'Chemistry 101 Quiz',
      subjectId: { name: 'Chemistry' },
      durationMinutes: 15,
      totalMarks: 5,
      passingMarks: 2,
      status: 'PUBLISHED',
      questions: [
        {
          id: 'q1',
          _id: 'q1',
          questionText: 'What is the chemical symbol for Water?',
          questionType: 'MCQ',
          marks: 5,
          options: [
            { optionText: 'H2O' },
            { optionText: 'CO2' },
          ],
        },
      ],
    });
    quizzesApi.startQuizAttempt.mockResolvedValue({
      _id: 'att1',
      attemptNumber: 1,
      startedAt: new Date().toISOString(),
      status: 'IN_PROGRESS',
    });
    quizzesApi.submitQuizAttempt.mockResolvedValue({
      _id: 'att1',
      status: 'EVALUATED',
      totalScore: 5,
      isPassed: true,
    });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'stud1',
        role: ROLES.STUDENT,
        permissions: [PERMISSIONS.QUIZZES_READ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should flow through start attempt, answering question, and submitting quiz', async () => {
    renderWithProviders('/quizzes/quiz1/take');

    // 1. Initial screen with start button
    expect(await screen.findByRole('heading', { level: 1, name: 'Chemistry 101 Quiz' })).toBeInTheDocument();
    const startBtn = screen.getByRole('button', { name: /Start Quiz Attempt/i });
    fireEvent.click(startBtn);

    // 2. Active runner should appear with question
    expect(await screen.findByText('What is the chemical symbol for Water?')).toBeInTheDocument();
    expect(screen.getByText('H2O')).toBeInTheDocument();

    // Select Option H2O
    fireEvent.click(screen.getByText('H2O'));

    // Submit quiz
    const finishBtn = screen.getByRole('button', { name: /Finish & Review/i });
    fireEvent.click(finishBtn);

    const confirmSubmitBtn = screen.getByRole('button', { name: /Confirm Submission/i });
    fireEvent.click(confirmSubmitBtn);

    // 3. Completed screen should render
    await waitFor(() => {
      expect(quizzesApi.submitQuizAttempt).toHaveBeenCalledWith('att1', {
        answers: [{ questionId: 'q1', selectedOptionIndex: 0, textAnswer: null }],
      });
    });
    expect(await screen.findByText('Quiz Completed!')).toBeInTheDocument();
    expect(screen.getByText(/5 \/ 5/i)).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });
});
