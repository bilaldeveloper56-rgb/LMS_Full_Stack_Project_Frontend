import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth.context';
import { LoadingState } from '@/components/feedback';

/**
 * Route guard for protected pages.
 * - Shows loading state during initial session check.
 * - Redirects unauthenticated users to /login preserving the requested path in state.
 * - Renders children or <Outlet /> for authenticated users.
 */
export function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <LoadingState message="Verifying authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}

export default AuthGuard;
