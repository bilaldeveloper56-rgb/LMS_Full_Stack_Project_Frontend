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
 * Validates whether a slug is reserved.
 * @param {string} slug
 * @returns {boolean}
 */
export const isReservedSubdomain = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  return RESERVED_SUBDOMAINS.includes(slug.trim().toLowerCase());
};

/**
 * Slugify a string into a clean lowercase URL-safe slug.
 * @param {string} text
 * @returns {string}
 */
export const slugify = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores to a single dash
    .replace(/^-+|-+$/g, ''); // strip leading and trailing hyphens
};
