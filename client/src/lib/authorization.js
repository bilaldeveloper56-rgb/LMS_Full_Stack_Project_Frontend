import { ROLES, DEFAULT_ROLE_PERMISSIONS, PERMISSION_SET } from '@/constants';

/**
 * Resolve the complete effective set of permissions for a user.
 *
 * Rules:
 * 1. Missing or unauthenticated user has 0 permissions.
 * 2. SUPER_ADMIN has implicit full access to all system permissions.
 * 3. Standard roles inherit DEFAULT_ROLE_PERMISSIONS[user.role] + any additive user.permissions[].
 *
 * @param {object|null} user - The authenticated user object
 * @returns {Set<string>} Set of effective permission strings
 */
export function getEffectivePermissions(user) {
  if (!user || !user.role) {
    return new Set();
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    return PERMISSION_SET;
  }

  const roleDefaults = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  const customOverrides = Array.isArray(user.permissions) ? user.permissions : [];

  return new Set([...roleDefaults, ...customOverrides]);
}

/**
 * Check if a user has a specific role.
 * @param {object|null} user
 * @param {string} role
 * @returns {boolean}
 */
export function hasRole(user, role) {
  if (!user || !role) return false;
  return user.role === role;
}

/**
 * Check if a user has any of the specified roles.
 * @param {object|null} user
 * @param {string[]} roles
 * @returns {boolean}
 */
export function hasAnyRole(user, roles) {
  if (!user || !Array.isArray(roles) || roles.length === 0) return false;
  return roles.includes(user.role);
}

/**
 * Check if a user has all of the specified roles.
 * @param {object|null} user
 * @param {string[]} roles
 * @returns {boolean}
 */
export function hasAllRoles(user, roles) {
  if (!user || !Array.isArray(roles) || roles.length === 0) return false;
  return roles.every((r) => r === user.role);
}

/**
 * Check if a user possesses a specific permission.
 * Super Admin implicitly bypasses all permission checks.
 * @param {object|null} user
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !permission) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;

  const permissions = getEffectivePermissions(user);
  return permissions.has(permission);
}

/**
 * Check if a user possesses at least one of the specified permissions.
 * @param {object|null} user
 * @param {string[]} permissions
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !Array.isArray(permissions) || permissions.length === 0) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;

  const effective = getEffectivePermissions(user);
  return permissions.some((p) => effective.has(p));
}

/**
 * Check if a user possesses all of the specified permissions.
 * @param {object|null} user
 * @param {string[]} permissions
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !Array.isArray(permissions) || permissions.length === 0) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;

  const effective = getEffectivePermissions(user);
  return permissions.every((p) => effective.has(p));
}

/**
 * General-purpose access evaluator for navigation items and route metadata.
 *
 * @param {object|null} user - Current user object
 * @param {object} rules - Authorization criteria
 * @param {string|string[]} [rules.roles] - Allowed role(s)
 * @param {string|string[]} [rules.permissions] - Required permission(s)
 * @param {'any'|'all'} [rules.mode='any'] - Match mode for permissions ('any' or 'all')
 * @param {string|string[]} [rules.hideForRoles] - Explicitly excluded role(s)
 * @returns {boolean}
 */
export function canAccess(user, rules = {}) {
  if (!user) return false;

  const { roles, permissions, mode = 'any', hideForRoles } = rules;

  // 1. Check excluded roles
  if (hideForRoles) {
    const excluded = Array.isArray(hideForRoles) ? hideForRoles : [hideForRoles];
    if (excluded.includes(user.role)) return false;
  }

  // 2. Check allowed roles
  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (allowed.length > 0 && !hasAnyRole(user, allowed)) {
      return false;
    }
  }

  // 3. Check required permissions
  if (permissions) {
    const perms = Array.isArray(permissions) ? permissions : [permissions];
    if (perms.length > 0) {
      if (mode === 'all') {
        if (!hasAllPermissions(user, perms)) return false;
      } else {
        if (!hasAnyPermission(user, perms)) return false;
      }
    }
  }

  return true;
}
