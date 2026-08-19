import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth.context';
import { LoadingState } from '@/components/feedback';

/**
 * Route guard for guest-only pages (e.g. /login).
 * - Shows loading state during initial session check.
 * - Redirects authenticated users to /dashboard.
 * - Renders children or <Outlet /> for unauthenticated guests.
 */
export function GuestGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <LoadingState message="Checking session..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}

export default GuestGuard;
