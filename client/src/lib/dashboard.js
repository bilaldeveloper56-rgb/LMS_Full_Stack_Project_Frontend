import { ROLES } from '@/constants';

/**
 * Determine the default dashboard route destination based on the user's role.
 *
 * Current Phase: All authenticated roles navigate to the central `/dashboard` foundation.
 * Architecture is structured to support dedicated role dashboards as modules are implemented in future phases.
 *
 * @param {object|null} user - The authenticated user object
 * @returns {string} Route path
 */
export function getDashboardPath(user) {
  if (!user || !user.role) {
    return '/login';
  }

  // All roles currently share the central dashboard shell
  switch (user.role) {
    case ROLES.SUPER_ADMIN:
    case ROLES.SCHOOL_ADMIN:
    case ROLES.TEACHER:
    case ROLES.STUDENT:
    case ROLES.PARENT:
    case ROLES.ACCOUNTANT:
    case ROLES.LIBRARIAN:
    case ROLES.STAFF:
    default:
      return '/dashboard';
  }
}

export default getDashboardPath;
