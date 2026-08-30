import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentForm } from '../components/StudentForm';
import * as studentsHooks from '../hooks/useStudents';

vi.mock('../hooks/useStudents', () => ({
  useAcademicOptions: vi.fn(),
  useUploadAvatar: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

const renderWithRouter = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('StudentForm Component', () => {
  const mockSessions = [
    { _id: 'sess-1', name: '2026-2027', isCurrent: true, status: 'ACTIVE' },
    { _id: 'sess-2', name: '2027-2028', isCurrent: false, status: 'UPCOMING' },
  ];

  const mockClasses = [
    { _id: 'cls-1', name: 'Grade 10', academicSessionId: 'sess-1' },
    { _id: 'cls-2', name: 'Grade 9', academicSessionId: 'sess-1' },
  ];

  const mockSections = [
    { _id: 'sec-1', name: 'Section A', code: 'A', classId: 'cls-1' },
    { _id: 'sec-2', name: 'Section B', code: 'B', classId: 'cls-1' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    studentsHooks.useAcademicOptions.mockReturnValue({
      sessions: mockSessions,
      classes: mockClasses,
      sections: mockSections,
      isLoadingSessions: false,
      isLoadingClasses: false,
      isLoadingSections: false,
      isClassesError: false,
      isSectionsError: false,
    });
  });

  it('renders dependent selection fields (Session, Class, Section) and personal details', () => {
    renderWithRouter(<StudentForm onSubmit={vi.fn()} />);

    expect(screen.getByText(/1, 2, 3. Academic Placement/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/1. Academic Session/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/2. Class/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/3. Section/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Admission Number/i)).toBeInTheDocument();
    expect(screen.getByText(/6. Cohort Review & Verification/i)).toBeInTheDocument();
  });

  it('auto-selects active session on mount', () => {
    renderWithRouter(<StudentForm onSubmit={vi.fn()} />);

    const sessionSelect = screen.getByLabelText(/1. Academic Session/i);
    expect(sessionSelect.value).toBe('sess-1');
  });

  it('updates selected section value when a section is chosen without triggering page navigation', () => {
    renderWithRouter(<StudentForm onSubmit={vi.fn()} />);

    const classSelect = screen.getByLabelText(/2. Class/i);
    fireEvent.change(classSelect, { target: { value: 'cls-1' } });

    const sectionSelect = screen.getByLabelText(/3. Section/i);
    fireEvent.change(sectionSelect, { target: { value: 'sec-1' } });

    expect(sectionSelect.value).toBe('sec-1');
  });

  it('renders a valid link to /classes when a class has no sections', () => {
    studentsHooks.useAcademicOptions.mockReturnValue({
      sessions: mockSessions,
      classes: mockClasses,
      sections: [],
      isLoadingSessions: false,
      isLoadingClasses: false,
      isLoadingSections: false,
      isClassesError: false,
      isSectionsError: false,
    });

    renderWithRouter(<StudentForm onSubmit={vi.fn()} />);

    const classSelect = screen.getByLabelText(/2. Class/i);
    fireEvent.change(classSelect, { target: { value: 'cls-1' } });

    const link = screen.getByRole('link', { name: /Create a section first/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/classes');
  });
});
