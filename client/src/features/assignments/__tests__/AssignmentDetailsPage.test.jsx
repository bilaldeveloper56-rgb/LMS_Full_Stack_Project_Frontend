import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { AssignmentDetailsPage } from '../pages/AssignmentDetailsPage';
import * as assignmentsApi from '../api/assignments.api';
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

const renderWithProviders = (initialEntry = '/assignments/asgn1') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/assignments/:id" element={<AssignmentDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('AssignmentDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assignmentsApi.fetchAssignmentById.mockResolvedValue({
      _id: 'asgn1',
      title: 'Physics Lab Report 1',
      description: 'Document your acceleration experiment observations.',
      subjectId: { name: 'Physics' },
      classId: { name: 'Grade 11' },
      sectionId: { name: 'Section B' },
      teacherId: { firstName: 'Isaac', lastName: 'Newton' },
      dueDate: '2026-10-15T23:59:59.000Z',
      maxScore: 50,
      status: 'PUBLISHED',
      attachments: [{ name: 'LabInstructions.pdf', url: 'https://example.com/lab.pdf' }],
      allowLateSubmission: true,
      lateSubmissionPenaltyPercentage: 5,
    });
    assignmentsApi.fetchAssignmentSubmissions.mockResolvedValue([
      {
        _id: 'sub1',
        studentId: { firstName: 'Marie', lastName: 'Curie', admissionNumber: 'ADM-101' },
        submissionContent: 'Observations recorded with 0.1s margin of error.',
        status: 'SUBMITTED',
        score: null,
        submittedAt: '2026-10-14T10:00:00.000Z',
      },
    ]);
    assignmentsApi.gradeSubmission.mockResolvedValue({ success: true });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'teach1',
        role: ROLES.TEACHER,
        permissions: [
          PERMISSIONS.ASSIGNMENTS_READ,
          PERMISSIONS.ASSIGNMENTS_UPDATE,
          PERMISSIONS.ASSIGNMENTS_GRADE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render assignment details, instructions, and submissions roster', async () => {
    renderWithProviders('/assignments/asgn1');

    expect(await screen.findByRole('heading', { level: 1, name: 'Physics Lab Report 1' })).toBeInTheDocument();
    expect(screen.getByText(/Document your acceleration experiment observations/i)).toBeInTheDocument();
    expect(screen.getByText('LabInstructions.pdf')).toBeInTheDocument();
    expect(screen.getByText('Marie Curie')).toBeInTheDocument();
  });

  it('should open grading modal and submit grade for student submission', async () => {
    renderWithProviders('/assignments/asgn1');

    expect(await screen.findByText('Marie Curie')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Grade/i }));
    expect(screen.getByText('Grade Student Submission')).toBeInTheDocument();
    expect(screen.getAllByText(/Marie Curie/i).length).toBeGreaterThanOrEqual(1);

    const scoreInput = screen.getByLabelText(/Awarded Score \/ Marks \*/i);
    fireEvent.change(scoreInput, { target: { value: '48' } });

    const feedbackInput = screen.getByLabelText(/Feedback & Constructive Comments/i);
    fireEvent.change(feedbackInput, { target: { value: 'Outstanding precision!' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Grade & Feedback/i }));

    await waitFor(() => {
      expect(assignmentsApi.gradeSubmission).toHaveBeenCalledWith('sub1', {
        score: 48,
        feedback: 'Outstanding precision!',
      });
    });
  });
});
