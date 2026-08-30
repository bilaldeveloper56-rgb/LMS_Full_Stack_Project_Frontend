import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import * as authContextModule from '@/features/auth/auth.context';
import * as mediaQueryModule from '@/hooks/useMediaQuery';
import { ROLES } from '@/constants';

describe('Role-Aware Sidebar Navigation', () => {
  beforeEach(() => {
    vi.spyOn(mediaQueryModule, 'useIsDesktop').mockReturnValue(true);
    vi.spyOn(mediaQueryModule, 'useIsMobile').mockReturnValue(false);
  });

  it('Super Admin should see platform administration navigation including Schools', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'sa', role: ROLES.SUPER_ADMIN },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Schools')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('School Admin should see school management items, but NOT platform Schools item', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'adm', role: ROLES.SCHOOL_ADMIN },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Schools')).not.toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Teachers')).toBeInTheDocument();
    expect(screen.getByText('Fees')).toBeInTheDocument();
  });

  it('Teacher should see teaching & academic items, but NOT Fees, Schools, or Audit Logs', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 't1', role: ROLES.TEACHER },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Assignments')).toBeInTheDocument();
    expect(screen.getByText('Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.queryByText('Schools')).not.toBeInTheDocument();
    expect(screen.queryByText('Fees')).not.toBeInTheDocument();
    expect(screen.queryByText('Audit Logs')).not.toBeInTheDocument();
  });

  it('Student should see permitted learning and personal items only', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 's1', role: ROLES.STUDENT },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Assignments')).toBeInTheDocument();
    expect(screen.getByText('Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Fees')).toBeInTheDocument(); // Student has FEES_READ to see fee balance
    expect(screen.queryByText('Teachers')).not.toBeInTheDocument(); // Student does not have TEACHERS_READ
    expect(screen.queryByText('Schools')).not.toBeInTheDocument();
    expect(screen.queryByText('Audit Logs')).not.toBeInTheDocument();
  });

  it('Accountant should see Financial and Report items', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'acc', role: ROLES.ACCOUNTANT },
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Fees')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.queryByText('Assignments')).not.toBeInTheDocument();
    expect(screen.queryByText('Quizzes')).not.toBeInTheDocument();
  });
});

describe('Mobile Sidebar Drawer Behavior', () => {
  beforeEach(() => {
    vi.spyOn(mediaQueryModule, 'useIsDesktop').mockReturnValue(false);
    vi.spyOn(mediaQueryModule, 'useIsMobile').mockReturnValue(true);
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: { id: 'adm', role: ROLES.SCHOOL_ADMIN },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render backdrop and close button when open on mobile', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveClass('z-[var(--z-overlay)]');

    const closeButton = screen.getByRole('button', { name: /Close menu/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('should trigger onClose when clicking close button or backdrop', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    const backdrop = container.querySelector('[aria-hidden="true"]');
    backdrop.click();
    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeButton = screen.getByRole('button', { name: /Close menu/i });
    closeButton.click();
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should trigger onClose when pressing Escape key on mobile', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
