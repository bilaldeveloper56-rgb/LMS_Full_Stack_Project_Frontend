import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { QuizzesPage } from '../pages/QuizzesPage';
import * as quizzesApi from '../api/quizzes.api';
import * as academicsApi from '@/features/academics/api/academics.api';
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

vi.mock('@/features/academics/api/academics.api', () => ({
  fetchAcademicSessions: vi.fn().mockResolvedValue({ sessions: [] }),
  fetchClasses: vi.fn().mockResolvedValue({ classes: [] }),
  fetchSections: vi.fn().mockResolvedValue({ sections: [] }),
  fetchSubjects: vi.fn().mockResolvedValue({ subjects: [] }),
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

describe('QuizzesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    quizzesApi.fetchQuizzes.mockResolvedValue({
      quizzes: [
        {
          _id: 'quiz1',
          title: 'Cell Biology Quiz',
          durationMinutes: 20,
          totalMarks: 10,
          passingMarks: 4,
          status: 'DRAFT',
          subjectId: { name: 'Biology' },
          classId: { name: 'Grade 9' },
          sectionId: { name: 'Section A' },
          questions: [{ questionText: 'What is a cell?' }],
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    quizzesApi.publishQuiz.mockResolvedValue({ success: true });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'teach1',
        role: ROLES.TEACHER,
        permissions: [
          PERMISSIONS.QUIZZES_READ,
          PERMISSIONS.QUIZZES_CREATE,
          PERMISSIONS.QUIZZES_UPDATE,
          PERMISSIONS.QUIZZES_DELETE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render quizzes list and trigger publish action', async () => {
    renderWithProviders(<QuizzesPage />);

    expect(await screen.findByText('Cell Biology Quiz')).toBeInTheDocument();
    expect(screen.getByText('Biology')).toBeInTheDocument();
    expect(screen.getAllByText('Draft').length).toBeGreaterThanOrEqual(1);

    const publishBtn = screen.getByRole('button', { name: /Publish/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(quizzesApi.publishQuiz).toHaveBeenCalledWith('quiz1');
    });
  });
});
