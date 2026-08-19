import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { TimetablePage } from '../pages/TimetablePage';
import * as timetableApi from '../api/timetable.api';
import * as academicsApi from '@/features/academics/api/academics.api';
import * as teachersApi from '@/features/teachers/api/teachers.api';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

vi.mock('../api/timetable.api', () => ({
  createTimetableSlot: vi.fn(),
  fetchTimetableSlots: vi.fn(),
  fetchSectionTimetable: vi.fn(),
  fetchTeacherTimetable: vi.fn(),
  fetchTimetableById: vi.fn(),
  updateTimetableSlot: vi.fn(),
  deleteTimetableSlot: vi.fn(),
}));

vi.mock('@/features/academics/api/academics.api', () => ({
  fetchAcademicSessions: vi.fn().mockResolvedValue({
    sessions: [{ _id: '507f1f77bcf86cd799439011', name: '2026-2027', isCurrent: true }],
  }),
  fetchClasses: vi.fn().mockResolvedValue({
    classes: [{ _id: '507f1f77bcf86cd799439012', name: 'Grade 10' }],
  }),
  fetchSections: vi.fn().mockResolvedValue({
    sections: [{ _id: '507f1f77bcf86cd799439013', name: 'Section A' }],
  }),
  fetchSubjects: vi.fn().mockResolvedValue({
    subjects: [{ _id: '507f1f77bcf86cd799439014', name: 'Mathematics', code: 'MATH101' }],
  }),
}));

vi.mock('@/features/teachers/api/teachers.api', () => ({
  fetchTeachers: vi.fn().mockResolvedValue({
    teachers: [
      {
        _id: '507f1f77bcf86cd799439015',
        firstName: 'Albert',
        lastName: 'Einstein',
        employeeId: 'EMP-001',
      },
    ],
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

describe('TimetablePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    timetableApi.fetchSectionTimetable.mockResolvedValue([
      {
        _id: 'slot1',
        dayOfWeek: 'MONDAY',
        periodNumber: 1,
        startTime: '08:00',
        endTime: '08:45',
        subjectId: { name: 'Mathematics', code: 'MATH101' },
        teacherId: { firstName: 'Albert', lastName: 'Einstein' },
        room: 'Lab 101',
      },
    ]);
    timetableApi.createTimetableSlot.mockResolvedValue({ success: true });
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'adm',
        role: ROLES.SCHOOL_ADMIN,
        permissions: [
          PERMISSIONS.TIMETABLE_READ,
          PERMISSIONS.TIMETABLE_CREATE,
          PERMISSIONS.TIMETABLE_UPDATE,
          PERMISSIONS.TIMETABLE_DELETE,
        ],
      },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render empty guidance before selecting class and section', async () => {
    renderWithProviders(<TimetablePage />);

    expect(await screen.findByText(/Academic Schedule & Timetable/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Class and Section to View Schedule/i)).toBeInTheDocument();
  });

  it('should render weekly timetable grid when class and section are selected', async () => {
    renderWithProviders(<TimetablePage />);

    // Wait for class option to load
    await screen.findByRole('option', { name: 'Grade 10' });

    // Select Class
    const classSelect = screen.getByRole('combobox', { name: /^Class$/i });
    fireEvent.change(classSelect, { target: { value: '507f1f77bcf86cd799439012' } });

    // Wait for section option to load
    await screen.findByRole('option', { name: 'Section A' });

    const sectionSelect = screen.getByRole('combobox', { name: /^Section$/i });
    fireEvent.change(sectionSelect, { target: { value: '507f1f77bcf86cd799439013' } });

    expect(await screen.findByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Albert Einstein')).toBeInTheDocument();
    expect(screen.getByText('08:00 - 08:45')).toBeInTheDocument();
  });
});
