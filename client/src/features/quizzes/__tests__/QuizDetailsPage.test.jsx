import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { QuizDetailsPage } from '../pages/QuizDetailsPage';
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

const renderWithProviders = (initialEntry = '/quizzes/quiz1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/quizzes/:id" element={<QuizDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('QuizDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    quizzesApi.fetchQuizById.mockResolvedValue({
      _id: 'quiz1',
      title: 'Modern World History Quiz',
      instructions: 'Choose the best answer for each question.',
      subjectId: { name: 'History' },
      classId: { name: 'Grade 10' },
      sectionId: { name: 'Section C' },
      teacherId: { firstName: 'George', lastName: 'Orwell' },
      durationMinutes: 25,
      totalMarks: 10,
      passingMarks: 5,
      status: 'PUBLISHED',
      maxAttempts: 2,
      questions: [
        {
          _id: 'q1',
          questionText: 'In which year did World War II end?',
          questionType: 'MCQ',
          marks: 5,
          options: [
            { optionText: '1945', isCorrect: true },
            { optionText: '1918', isCorrect: false },
          ],
          explanation: 'World War II formally ended in September 1945.',
        },
      ],
    });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'teach1',
        role: ROLES.TEACHER,
        permissions: [
          PERMISSIONS.QUIZZES_READ,
          PERMISSIONS.QUIZZES_UPDATE,
          PERMISSIONS.QUIZZES_GRADE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render quiz information and questions overview for teacher', async () => {
    renderWithProviders('/quizzes/quiz1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Modern World History Quiz' })).toBeInTheDocument();
    expect(screen.getByText(/Choose the best answer for each question/i)).toBeInTheDocument();
    expect(screen.getByText('In which year did World War II end?')).toBeInTheDocument();
    expect(screen.getByText('1945')).toBeInTheDocument();
    expect(screen.getByText('(Correct Answer)')).toBeInTheDocument();
  });
});
