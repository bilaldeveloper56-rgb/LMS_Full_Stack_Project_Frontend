import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleGuard } from '../RoleGuard';
import { PermissionGuard } from '../PermissionGuard';
import * as authContextModule from '@/features/auth/auth.context';
import { ROLES, PERMISSIONS } from '@/constants';

describe('RoleGuard & PermissionGuard Components', () => {
  describe('RoleGuard', () => {
    it('should show loading state when auth is initializing', () => {
      vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        user: null,
      });

      render(
        <MemoryRouter>
          <RoleGuard roles={[ROLES.SCHOOL_ADMIN]}>
            <div>Admin Dashboard</div>
          </RoleGuard>
        </MemoryRouter>
      );

      expect(screen.getByText(/Verifying permissions/i)).toBeInTheDocument();
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });

    it('should redirect unauthenticated user to /login', () => {
      vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <RoleGuard roles={[ROLES.SCHOOL_ADMIN]}>
                  <div>Admin Dashboard</div>
                </RoleGuard>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });

    it('should render content when user has allowed role', () => {
      vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'u1', role: ROLES.SCHOOL_ADMIN },
      });

      render(
        <MemoryRouter>
          <RoleGuard roles={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]}>
            <div>Admin Dashboard</div>
          </RoleGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('should redirect to /403 when user has wrong role and no custom fallback is provided', () => {
      vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'u2', role: ROLES.STUDENT },
      });

      render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route
              path="/admin"
              element={
                <RoleGuard roles={[ROLES.SCHOOL_ADMIN]}>
                  <div>Admin Dashboard</div>
                </RoleGuard>
              }
            />
            <Route path="/403" element={<div>Access Denied 403</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Access Denied 403')).toBeInTheDocument();
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });

    it('should render custom fallback when user has wrong role and fallback is specified', () => {
      vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'u3', role: ROLES.TEACHER },
      });

      render(
        <MemoryRouter>
          <RoleGuard roles={[ROLES.SUPER_ADMIN]} fallback={<div>Not A Super Admin</div>}>
            <div>Super Admin Feature</div>
          </RoleGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Not A Super Admin')).toBeInTheDocument();
      expect(screen.queryByText('Super Admin Feature')).not.toBeInTheDocument();
    });
  });

  describe('PermissionGuard', () => {
    it('should render children when user possesses required permission', () => {
      vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'u1', role: ROLES.TEACHER },
      });

      render(
        <MemoryRouter>
          <PermissionGuard permission={PERMISSIONS.ASSIGNMENTS_CREATE}>
            <button>Create Assignment</button>
          </PermissionGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Create Assignment')).toBeInTheDocument();
    });

    it('should render null/fallback when user lacks required permission', () => {
      vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'u1', role: ROLES.STUDENT },
      });

      render(
        <MemoryRouter>
          <PermissionGuard
            permission={PERMISSIONS.FEES_CREATE}
            fallback={<div>No fee creation rights</div>}
          >
            <button>Create Fee</button>
          </PermissionGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('No fee creation rights')).toBeInTheDocument();
      expect(screen.queryByText('Create Fee')).not.toBeInTheDocument();
    });

    it('should evaluate mode="all" with multiple permissions', () => {
      vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'u1', role: ROLES.ACCOUNTANT },
      });

      // Accountant has FEES_READ, but not ASSIGNMENTS_CREATE
      render(
        <MemoryRouter>
          <PermissionGuard
            permissions={[PERMISSIONS.FEES_READ, PERMISSIONS.ASSIGNMENTS_CREATE]}
            mode="all"
            fallback={<div>Denied Multi-Perm</div>}
          >
            <div>Special Panel</div>
          </PermissionGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('Denied Multi-Perm')).toBeInTheDocument();
      expect(screen.queryByText('Special Panel')).not.toBeInTheDocument();
    });

    it('should redirect to redirectTo path (e.g. /403) when unauthorized route guard', () => {
      vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        user: { id: 'u1', role: ROLES.STUDENT },
      });

      render(
        <MemoryRouter initialEntries={['/reports']}>
          <Routes>
            <Route
              path="/reports"
              element={
                <PermissionGuard permission={PERMISSIONS.REPORTS_READ} redirectTo="/403">
                  <div>Reports Page</div>
                </PermissionGuard>
              }
            />
            <Route path="/403" element={<div>Access Denied 403</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Access Denied 403')).toBeInTheDocument();
      expect(screen.queryByText('Reports Page')).not.toBeInTheDocument();
    });
  });
});
