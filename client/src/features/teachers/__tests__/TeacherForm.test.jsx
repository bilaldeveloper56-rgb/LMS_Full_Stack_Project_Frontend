import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { TeacherForm } from '../components/TeacherForm';

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

describe('TeacherForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form sections and trigger validation on empty submit', async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<TeacherForm onSubmit={handleSubmit} />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Employment & Qualifications')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Save Teacher/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Employee ID is required')).toBeInTheDocument();
    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid teacher data successfully', async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<TeacherForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/Employee ID \*/i), { target: { value: 'EMP-100' } });
    fireEvent.change(screen.getByLabelText(/First Name \*/i), { target: { value: 'Enrico' } });
    fireEvent.change(screen.getByLabelText(/Last Name \*/i), { target: { value: 'Fermi' } });
    fireEvent.change(screen.getByLabelText(/Email Address \*/i), { target: { value: 'fermi@school.edu' } });

    const submitBtn = screen.getByRole('button', { name: /Save Teacher/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'EMP-100',
          firstName: 'Enrico',
          lastName: 'Fermi',
          email: 'fermi@school.edu',
        }),
        expect.anything()
      );
    });
  });
});
