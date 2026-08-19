import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForbiddenPage } from '../ForbiddenPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ForbiddenPage (403)', () => {
  it('should render 403 status, Access Denied heading, and user-friendly explanation', () => {
    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>
    );

    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(
      screen.getByText(/You do not have the required permissions or role access/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/schools:manage/i)).not.toBeInTheDocument();
  });

  it('should call navigate(-1) when clicking Go Back button', () => {
    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Go Back/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should render link to /dashboard', () => {
    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
});
