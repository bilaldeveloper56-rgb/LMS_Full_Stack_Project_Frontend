import { useMemo } from 'react';
import { useAuth } from '@/features/auth';
import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccess,
  getEffectivePermissions,
} from '@/lib/authorization';

/**
 * Custom hook providing authorization checks bound to the current authenticated user.
 */
export function useAuthorization() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const effectivePermissions = useMemo(() => {
    return getEffectivePermissions(user);
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    userRole: user?.role || null,
    effectivePermissions,
    hasRole: (role) => hasRole(user, role),
    hasAnyRole: (roles) => hasAnyRole(user, roles),
    hasAllRoles: (roles) => hasAllRoles(user, roles),
    hasPermission: (permission) => hasPermission(user, permission),
    hasAnyPermission: (permissions) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions) => hasAllPermissions(user, permissions),
    canAccess: (rules) => canAccess(user, rules),
  };
}

export default useAuthorization;
