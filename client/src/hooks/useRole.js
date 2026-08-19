import { useAuth } from '@/features/auth';
import { ROLES } from '@/constants';

/**
 * Convenience hook exposing boolean flags for the current user's role.
 */
export function useRole() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const role = user?.role || null;

  return {
    role,
    isAuthenticated,
    isLoading,
    isSuperAdmin: role === ROLES.SUPER_ADMIN,
    isSchoolAdmin: role === ROLES.SCHOOL_ADMIN,
    isTeacher: role === ROLES.TEACHER,
    isStudent: role === ROLES.STUDENT,
    isParent: role === ROLES.PARENT,
    isAccountant: role === ROLES.ACCOUNTANT,
    isLibrarian: role === ROLES.LIBRARIAN,
    isStaff: role === ROLES.STAFF,
  };
}

export default useRole;
