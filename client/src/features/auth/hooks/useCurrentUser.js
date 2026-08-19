import { useAuth } from '../auth.context';

/**
 * Hook to retrieve the current user and their basic role/status information.
 */
export function useCurrentUser() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    role: user?.role || null,
    schoolId: user?.schoolId || null,
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
  };
}

export default useCurrentUser;
