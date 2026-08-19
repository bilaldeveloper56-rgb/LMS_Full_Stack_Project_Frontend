import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { hasAnyPermission, hasAllPermissions } from '@/lib/authorization';
import { LoadingState } from '@/components/feedback';

/**
 * Permission-based authorization guard component.
 *
 * Usage for UI elements:
 *   <PermissionGuard permission={PERMISSIONS.STUDENTS_CREATE}>
 *     <AddStudentButton />
 *   </PermissionGuard>
 *
 * Usage with multiple permissions and 'all' requirement:
 *   <PermissionGuard
 *     permissions={[PERMISSIONS.FEES_READ, PERMISSIONS.FEES_MANAGE]}
 *     mode="all"
 *   >
 *     <ManageFeesPanel />
 *   </PermissionGuard>
 *
 * Usage as route guard:
 *   <PermissionGuard permission={PERMISSIONS.REPORTS_READ} redirectTo="/403">
 *     <ReportsPage />
 *   </PermissionGuard>
 *
 * @param {object} props
 * @param {string} [props.permission] - Single permission string
 * @param {string[]} [props.permissions] - Array of permission strings
 * @param {'any'|'all'} [props.mode='any'] - Evaluation mode for multiple permissions
 * @param {React.ReactNode} [props.fallback=null] - Rendered when permission check fails
 * @param {string} [props.redirectTo] - Route to redirect to if unauthorized (e.g. '/403')
 * @param {React.ReactNode} [props.children]
 */
export function PermissionGuard({
  permission,
  permissions,
  mode = 'any',
  fallback = null,
  redirectTo,
  children,
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <LoadingState message="Verifying permissions..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return redirectTo ? <Navigate to="/login" replace /> : fallback;
  }

  const rawList = permissions || (permission ? [permission] : []);
  const permList = Array.isArray(rawList) ? rawList : [rawList];

  let authorized = true;
  if (permList.length > 0) {
    authorized =
      mode === 'all'
        ? hasAllPermissions(user, permList)
        : hasAnyPermission(user, permList);
  }

  if (!authorized) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return fallback;
  }

  return children ? children : <Outlet />;
}

export default PermissionGuard;
