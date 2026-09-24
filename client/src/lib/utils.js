import clsx from 'clsx';

/**
 * Merge class names conditionally.
 * Wrapper around clsx for consistent usage.
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format a date to a readable string.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(
    new Date(date)
  );
}

/**
 * Format a date and time to a readable string.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatDateTime(date, options = {}) {
  if (!date) return '';
  const defaults = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(
    new Date(date)
  );
}

export const APP_CURRENCY = 'PKR';
export const APP_CURRENCY_SYMBOL = '₨';
export const APP_CURRENCY_LOCALE = 'en-PK';

/**
 * Format a number as currency (defaulting to Pakistani Rupee - PKR / ₨).
 * @param {number|string} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(amount, currency = APP_CURRENCY) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${APP_CURRENCY_SYMBOL}0`;
  }
  const numericAmount = Number(amount);
  const formatted = numericAmount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${APP_CURRENCY_SYMBOL}${formatted}`;
}

/**
 * Format a number with standard thousand separators.
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Truncate text to a max length.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '…';
}

/**
 * Resolves the authoritative API Base URL.
 * In development, defaults to '/api/v1' (proxied by Vite).
 * In production, defaults to 'https://api.lmsprime.online/api/v1'.
 * Can be overridden by VITE_API_BASE_URL.
 * @returns {string}
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim();
  }
  return import.meta.env?.PROD ? 'https://api.lmsprime.online/api/v1' : '/api/v1';
}

/**
 * Extract readable, user-facing error message from API error response or network failure.
 * Distinguishes offline, 401, 403, 404, 422, 429, 500, 502/503/504, timeout, and network errors.
 * Never leaks stack traces, database strings, or internal secrets.
 * @param {Error|object} error
 * @param {string} [fallback='An unexpected error occurred.']
 * @returns {string}
 */
export function getErrorMessage(error, fallback = 'An unexpected error occurred.') {
  if (!error) return fallback;

  // 1. Browser offline detection
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'You appear to be offline. Please check your internet connection.';
  }

  const response = error?.response;
  const status = response?.status;
  const data = response?.data;

  // 2. Specific Backend Validation Errors (e.g. 422, 400 with validation message list)
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(', ');
  }

  // 3. Backend-provided explicit operational error message (sanitized)
  if (data?.message && typeof data.message === 'string') {
    const msg = data.message;
    const isSensitive = /mongo|econnrefused|jwt secret|cloudinary|sql|stack trace|at Object\./i.test(msg);
    if (!isSensitive) {
      return msg;
    }
  }

  // 4. HTTP Status Code Classification
  if (status) {
    switch (status) {
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'The server is taking longer than expected. Please try again.';
      case 422:
        return data?.message || 'The provided data failed validation. Please check your inputs.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Something went wrong on the server. Please try again.';
      case 502:
      case 503:
      case 504:
        return 'The server is temporarily unavailable. Please try again in a moment.';
      default:
        if (status >= 500) {
          return 'The server is temporarily unavailable. Please try again in a moment.';
        }
    }
  }

  // 5. Temporary cold-start timeout (Axios ECONNABORTED or message containing timeout)
  if (error.code === 'ECONNABORTED' || (error.message && error.message.toLowerCase().includes('timeout'))) {
    return 'The server is waking up. Please wait a moment while we reconnect.';
  }

  // 6. Genuine network / connection failure (no response received)
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !response) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[Network Error Details]', {
        code: error.code,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
    }
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // 7. Generic fallback
  if (error.message && typeof error.message === 'string') {
    const isTechMsg = /status code|network|failed with/i.test(error.message);
    if (!isTechMsg) {
      return error.message;
    }
  }

  return fallback;
}

/**
 * Generate initials from a name.
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
export function getInitials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
