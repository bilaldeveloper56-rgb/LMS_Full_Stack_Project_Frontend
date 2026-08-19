import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { StudentForm } from '../components/StudentForm';
import * as studentsApi from '../api/students.api';

vi.mock('../api/students.api', () => ({
  fetchClasses: vi.fn().mockResolvedValue([{ _id: '507f1f77bcf86cd799439012', name: 'Grade 10' }]),
  fetchSections: vi.fn().mockResolvedValue([{ _id: '507f1f77bcf86cd799439013', name: 'Section A' }]),
  fetchAcademicSessions: vi.fn().mockResolvedValue([{ _id: '507f1f77bcf86cd799439011', name: '2026-2027' }]),
  uploadStudentAvatar: vi.fn(),
}));

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>
  );
};

describe('StudentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form sections and trigger validation on empty submit', async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<StudentForm onSubmit={handleSubmit} />);

    expect(screen.getByText('Personal Details')).toBeInTheDocument();
    expect(screen.getByText('Academic Enrollment')).toBeInTheDocument();
    expect(screen.getByText('Contact & Address')).toBeInTheDocument();
    expect(screen.getByText('Emergency Contact')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Save Student/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Admission number is required')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data successfully', async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<StudentForm onSubmit={handleSubmit} />);

    // Wait for async dropdowns to load
    await waitFor(() => {
      expect(screen.getByText('2026-2027')).toBeInTheDocument();
      expect(screen.getByText('Grade 10')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Johnson' } });
    fireEvent.change(screen.getByLabelText(/Admission Number/i), { target: { value: 'ADM-099' } });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), { target: { value: '2010-02-14' } });

    fireEvent.change(screen.getByLabelText(/Academic Session/i), {
      target: { value: '507f1f77bcf86cd799439011' },
    });
    fireEvent.change(screen.getByLabelText(/Class \*/i), {
      target: { value: '507f1f77bcf86cd799439012' },
    });

    // Wait for section dropdown to populate
    await waitFor(() => {
      expect(screen.getByText('Section A')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Section \*/i), {
      target: { value: '507f1f77bcf86cd799439013' },
    });

    const submitBtn = screen.getByRole('button', { name: /Save Student/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Alice',
          lastName: 'Johnson',
          admissionNumber: 'ADM-099',
          dateOfBirth: '2010-02-14',
          academicSessionId: '507f1f77bcf86cd799439011',
          classId: '507f1f77bcf86cd799439012',
          sectionId: '507f1f77bcf86cd799439013',
        }),
        expect.anything()
      );
    });
  });
});
