import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { ResultsPage } from '../pages/ResultsPage';
import * as resultApi from '../api/results.api';
import * as examApi from '@/features/exams/api/exams.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/results.api', () => ({
  createGradingScale: vi.fn(),
  fetchGradingScales: vi.fn().mockResolvedValue([]),
  recordMarks: vi.fn(),
  bulkRecordMarks: vi.fn(),
  fetchStudentReportCard: vi.fn(),
  fetchSectionResults: vi.fn().mockResolvedValue([]),
  lockSectionResults: vi.fn(),
  unlockSectionResults: vi.fn(),
  publishSectionResults: vi.fn(),
}));

vi.mock('@/features/exams/api/exams.api', () => ({
  fetchExams: vi.fn(),
  fetchExamById: vi.fn(),
}));

vi.mock('@/features/academics', () => ({
  useClasses: () => ({
    data: [{ _id: 'cls1', name: 'Class 10' }],
    isLoading: false,
  }),
  useSections: () => ({
    data: [{ _id: 'sec1', name: 'Section A' }],
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

describe('ResultsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'u1',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.RESULTS_READ,
          PERMISSIONS.RESULTS_CREATE,
          PERMISSIONS.RESULTS_LOCK,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });

    examApi.fetchExams.mockResolvedValue({
      exams: [{ _id: 'e1', id: 'e1', name: 'Final Exam 2026' }],
      pagination: { page: 1, total: 1 },
    });

    examApi.fetchExamById.mockResolvedValue({
      _id: 'e1',
      id: 'e1',
      name: 'Final Exam 2026',
      papers: [
        {
          _id: 'p1',
          id: 'p1',
          classId: { _id: 'cls1', name: 'Class 10' },
          subjectId: { _id: 'sub1', name: 'Mathematics' },
          totalMarks: 100,
        },
      ],
    });
  });

  it('should render results page with tabs and allow switching between marks entry and roster', async () => {
    renderWithProviders(<ResultsPage />);

    expect(await screen.findByText('Academic Results & Marks Entry')).toBeInTheDocument();
    expect(screen.getByText('Marks Entry (By Paper)')).toBeInTheDocument();
    expect(screen.getByText('Section Results Roster')).toBeInTheDocument();

    // Switch to section results roster tab
    fireEvent.click(screen.getByText('Section Results Roster'));
    expect(screen.getByText(/Please select an Examination Term, Class, and Section/i)).toBeInTheDocument();
  });
});
