import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { AssignmentsPage } from '../pages/AssignmentsPage';
import * as assignmentsApi from '../api/assignments.api';
import * as academicsApi from '@/features/academics/api/academics.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/assignments.api', () => ({
  createAssignment: vi.fn(),
  fetchAssignments: vi.fn(),
  fetchAssignmentById: vi.fn(),
  updateAssignment: vi.fn(),
  deleteAssignment: vi.fn(),
  publishAssignment: vi.fn(),
  submitAssignment: vi.fn(),
  fetchAssignmentSubmissions: vi.fn(),
  gradeSubmission: vi.fn(),
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

describe('AssignmentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assignmentsApi.fetchAssignments.mockResolvedValue({
      assignments: [
        {
          _id: 'asgn1',
          title: 'Trigonometry Homework 1',
          description: 'Solve questions 1-5',
          subjectId: { name: 'Mathematics' },
          classId: { name: 'Grade 10' },
          sectionId: { name: 'Section A' },
          dueDate: '2026-09-30T23:59:59.000Z',
          maxScore: 100,
          status: 'DRAFT',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    assignmentsApi.publishAssignment.mockResolvedValue({ success: true });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'teach1',
        role: ROLES.TEACHER,
        permissions: [
          PERMISSIONS.ASSIGNMENTS_READ,
          PERMISSIONS.ASSIGNMENTS_CREATE,
          PERMISSIONS.ASSIGNMENTS_UPDATE,
          PERMISSIONS.ASSIGNMENTS_DELETE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render assignments list and headers', async () => {
    renderWithProviders(<AssignmentsPage />);

    expect(await screen.findByText('Trigonometry Homework 1')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getAllByText('Draft').length).toBeGreaterThanOrEqual(1);
  });

  it('should publish draft assignment from table action', async () => {
    renderWithProviders(<AssignmentsPage />);

    expect(await screen.findByText('Trigonometry Homework 1')).toBeInTheDocument();

    const publishBtn = screen.getByRole('button', { name: /Publish/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(assignmentsApi.publishAssignment).toHaveBeenCalledWith('asgn1');
    });
  });
});
