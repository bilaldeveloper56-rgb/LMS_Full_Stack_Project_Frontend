import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback';
import { ParentForm } from '../components/ParentForm';

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

describe('ParentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate required fields on submit', async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<ParentForm onSubmit={handleSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /Save Parent/i }));

    expect(await screen.findByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid parent data', async () => {
    const handleSubmit = vi.fn();
    renderWithProviders(<ParentForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/First Name \*/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText(/Last Name \*/i), { target: { value: 'Parr' } });
    fireEvent.change(screen.getByLabelText(/Email Address \*/i), { target: { value: 'mr.incredible@super.org' } });
    fireEvent.change(screen.getByLabelText(/Primary Phone Number \*/i), { target: { value: '555-9876' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Parent/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Bob',
          lastName: 'Parr',
          email: 'mr.incredible@super.org',
          phone: '555-9876',
        }),
        expect.anything()
      );
    });
  });
});
