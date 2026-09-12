export const RESERVED_SUBDOMAINS = Object.freeze([
  'app',
  'www',
  'api',
  'admin',
  'mail',
  'support',
  'help',
  'status',
  'localhost',
  'staging',
  'dev',
  'test',
  'demo',
  'root',
  'static',
  'assets',
  'cdn',
  'docs',
  'portal',
  'superadmin',
  'super-admin',
  'auth',
  'dashboard',
  'account',
]);

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Check if a slug string is a reserved platform subdomain.
 * @param {string} slug
 * @returns {boolean}
 */
export const isReservedSubdomain = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  return RESERVED_SUBDOMAINS.includes(slug.trim().toLowerCase());
};

/**
 * Cleanly slugify a string for subdomain usage.
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Determine the tenant subdomain from the current window location.
 *
 * @param {string} [hostname] - Optional hostname override (defaults to window.location.hostname)
 * @param {string} [search] - Optional search query override (defaults to window.location.search)
 * @returns {string|null} The resolved school slug, or null if on platform host
 */
export const getTenantSubdomain = (
  hostname = typeof window !== 'undefined' ? window.location?.hostname : '',
  search = typeof window !== 'undefined' ? window.location?.search : ''
) => {
  if (!hostname) return null;

  const cleanHost = hostname.toLowerCase().trim();

  // Local development fallback via query param (e.g. http://localhost:5173/?tenant=bright-future)
  if (
    (cleanHost === 'localhost' || cleanHost === '127.0.0.1') &&
    search
  ) {
    const params = new URLSearchParams(search);
    const queryTenant = params.get('tenant');
    if (queryTenant) {
      const candidate = queryTenant.toLowerCase().trim();
      if (SLUG_REGEX.test(candidate) && !isReservedSubdomain(candidate)) {
        return candidate;
      }
    }
  }

  // Check production wildcard: *.lmsprime.online
  const prodMatch = cleanHost.match(/^([a-z0-9-]+)\.lmsprime\.online$/);
  if (prodMatch) {
    const candidate = prodMatch[1];
    if (isReservedSubdomain(candidate)) return null;
    if (SLUG_REGEX.test(candidate)) return candidate;
    return null;
  }

  // Check development wildcard: *.localhost
  const devMatch = cleanHost.match(/^([a-z0-9-]+)\.localhost$/);
  if (devMatch) {
    const candidate = devMatch[1];
    if (isReservedSubdomain(candidate)) return null;
    if (SLUG_REGEX.test(candidate)) return candidate;
    return null;
  }

  return null;
};

/**
 * Determine if current host is the primary platform application host (app.lmsprime.online).
 * @param {string} [hostname]
 * @returns {boolean}
 */
export const isPlatformHost = (
  hostname = typeof window !== 'undefined' ? window.location?.hostname : ''
) => {
  if (!hostname) return true;
  const clean = hostname.toLowerCase().trim();
  return (
    clean === 'app.lmsprime.online' ||
    clean === 'lmsprime.online' ||
    clean === 'localhost' ||
    clean === '127.0.0.1'
  );
};
