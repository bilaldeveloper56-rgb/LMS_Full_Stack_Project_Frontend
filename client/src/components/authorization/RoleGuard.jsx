import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { hasAnyRole } from '@/lib/authorization';
import { LoadingState } from '@/components/feedback';

/**
 * Role-based authorization guard component.
 *
 * Usage as route wrapper:
 *   <RoleGuard roles={[ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN]}>
 *     <AdminPage />
 *   </RoleGuard>
 *
 * Usage as conditional element with custom fallback:
 *   <RoleGuard roles={[ROLES.TEACHER]} fallback={null}>
 *     <TeacherOnlyButton />
 *   </RoleGuard>
 *
 * @param {object} props
 * @param {string|string[]} props.roles - Allowed role or array of allowed roles
 * @param {React.ReactNode} [props.fallback] - Custom fallback content when unauthorized (defaults to redirecting to /403)
 * @param {React.ReactNode} [props.children]
 */
export function RoleGuard({ roles, fallback, children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <LoadingState message="Verifying permissions..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const roleList = Array.isArray(roles) ? roles : [roles];
  const authorized = roleList.length === 0 || hasAnyRole(user, roleList);

  if (!authorized) {
    if (fallback !== undefined) {
      return fallback;
    }
    return <Navigate to="/403" replace />;
  }

  return children ? children : <Outlet />;
}

export default RoleGuard;
