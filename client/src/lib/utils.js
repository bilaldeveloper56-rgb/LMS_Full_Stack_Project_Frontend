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
 * Extract readable error message from API error response.
 * @param {Error|object} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';

  // Axios error with backend response
  const data = error?.response?.data;
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(', ');
  }
  if (data?.message) return data.message;

  // Standard Error
  if (error.message) return error.message;

  return 'An unexpected error occurred.';
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
