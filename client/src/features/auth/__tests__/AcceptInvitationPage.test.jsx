import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AcceptInvitationPage } from '../pages/AcceptInvitationPage';
import * as schoolsApi from '@/features/schools/api/schools.api';

vi.mock('@/features/schools/api/schools.api', () => ({
  acceptInvitation: vi.fn(),
}));

describe('AcceptInvitationPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display missing token warning if no token in query parameters', () => {
    render(
      <MemoryRouter initialEntries={['/accept-invitation']}>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Invalid Invitation Link/i)).toBeInTheDocument();
    expect(screen.getByText(/No invitation token was found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Go to Sign In/i })).toBeInTheDocument();
  });

  it('should render password activation form when token is present', () => {
    render(
      <MemoryRouter initialEntries={['/accept-invitation?token=valid-test-token-123']}>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Activate Your Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete Activation/i })).toBeInTheDocument();
  });

  it('should show validation error if passwords do not match or do not meet requirements', async () => {
    render(
      <MemoryRouter initialEntries={['/accept-invitation?token=valid-test-token-123']}>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^New Password/i, { selector: 'input' }), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm Password/i, { selector: 'input' }), {
      target: { value: 'different' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Complete Activation/i }));

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should call acceptInvitation API on valid form submission and show success view', async () => {
    schoolsApi.acceptInvitation.mockResolvedValueOnce({
      success: true,
      message: 'Account activated successfully',
      data: { user: { id: 'u1', email: 'admin@school.com', role: 'SCHOOL_ADMIN' } },
    });

    render(
      <MemoryRouter initialEntries={['/accept-invitation?token=valid-test-token-123']}>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^New Password/i, { selector: 'input' }), {
      target: { value: 'AdminPass@2026' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm Password/i, { selector: 'input' }), {
      target: { value: 'AdminPass@2026' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Complete Activation/i }));

    await waitFor(() => {
      expect(schoolsApi.acceptInvitation).toHaveBeenCalledWith({
        token: 'valid-test-token-123',
        password: 'AdminPass@2026',
        confirmPassword: 'AdminPass@2026',
      });
      expect(screen.getByText(/Account Activated!/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Proceed to Sign In/i })).toBeInTheDocument();
    });
  });

  it('should display server error alert when acceptInvitation fails', async () => {
    schoolsApi.acceptInvitation.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: 'Invalid or expired invitation token' },
      },
    });

    render(
      <MemoryRouter initialEntries={['/accept-invitation?token=expired-token-123']}>
        <AcceptInvitationPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/^New Password/i, { selector: 'input' }), {
      target: { value: 'AdminPass@2026' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirm Password/i, { selector: 'input' }), {
      target: { value: 'AdminPass@2026' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Complete Activation/i }));

    await waitFor(() => {
      expect(screen.getByText(/Activation Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid or expired invitation token/i)).toBeInTheDocument();
    });
  });
});
