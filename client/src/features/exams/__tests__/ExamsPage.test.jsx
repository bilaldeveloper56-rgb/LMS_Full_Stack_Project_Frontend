import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { ExamsPage } from '../pages/ExamsPage';
import * as examApi from '../api/exams.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/exams.api', () => ({
  fetchExams: vi.fn(),
  publishExam: vi.fn(),
  deleteExam: vi.fn(),
}));

vi.mock('@/features/academics', () => ({
  useAcademicSessions: () => ({
    data: [{ _id: 'sess1', name: '2026-2027' }],
    isLoading: false,
  }),
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

describe('ExamsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.EXAMS_READ,
          PERMISSIONS.EXAMS_CREATE,
          PERMISSIONS.EXAMS_PUBLISH,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    examApi.fetchExams.mockResolvedValue({
      exams: [
        {
          _id: 'e1',
          id: 'e1',
          name: 'Annual Examination 2026',
          examType: 'FINAL',
          startDate: '2026-12-01T00:00:00.000Z',
          endDate: '2026-12-20T00:00:00.000Z',
          status: 'DRAFT',
          isPublished: false,
          academicSessionId: { _id: 'sess1', name: '2026-2027' },
          papers: [],
        },
      ],
      pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
    });

    examApi.publishExam.mockResolvedValue({ id: 'e1', isPublished: true });
  });

  it('should render exam list and allow publishing draft exam', async () => {
    renderWithProviders(<ExamsPage />);

    expect(await screen.findByText('Annual Examination 2026')).toBeInTheDocument();
    expect(screen.getAllByText('Final Exam').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Draft').length).toBeGreaterThanOrEqual(1);

    const publishBtn = screen.getByRole('button', { name: /Publish Exam Schedule/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(examApi.publishExam).toHaveBeenCalledWith('e1');
    });
  });
});
