import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../components/AuthGuard';
import { GuestGuard } from '../components/GuestGuard';
import * as authContextModule from '../auth.context';

describe('Auth & Guest Guards', () => {
  it('AuthGuard should show loading state when auth is initializing', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected Dashboard</div>
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Verifying authentication/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
  });

  it('AuthGuard should redirect unauthenticated user to /login', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected Dashboard</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
  });

  it('AuthGuard should render protected content when authenticated', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u1' },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <div>Protected Dashboard</div>
              </AuthGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
  });

  it('GuestGuard should redirect authenticated user to /dashboard', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'u1' },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard>
                <div>Guest Login Page</div>
              </GuestGuard>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
    expect(screen.queryByText('Guest Login Page')).not.toBeInTheDocument();
  });

  it('GuestGuard should render login content when unauthenticated', () => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard>
                <div>Guest Login Page</div>
              </GuestGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Guest Login Page')).toBeInTheDocument();
  });
});
