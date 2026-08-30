import { env } from '../config/env.js';

/**
 * Get the clean, primary frontend base URL (e.g. Vercel deployment).
 * Safely handles comma-separated CORS origins and trailing slashes.
 * @returns {string} E.g. 'https://your-frontend.vercel.app'
 */
export const getPrimaryFrontendUrl = () => {
  const raw = env.FRONTEND_URL || 'http://localhost:5173';
  const primary = raw.split(',')[0].trim();
  return primary.replace(/\/+$/, '');
};

/**
 * Construct an absolute URL targeting the frontend application (e.g. Vercel deployment).
 * @param {string} [path=''] - Path (e.g. '/accept-invitation')
 * @param {Record<string, string|number>} [params] - Query parameters (e.g. { token: 'abc' })
 * @returns {string} Fully qualified frontend URL
 */
export const buildFrontendUrl = (path = '', params = {}) => {
  const base = getPrimaryFrontendUrl();
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${base}${cleanPath}?${queryString}` : `${base}${cleanPath}`;
};
