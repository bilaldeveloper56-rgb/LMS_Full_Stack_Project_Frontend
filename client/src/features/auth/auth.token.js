/**
 * In-memory storage for JWT access token.
 * Keeping the access token in memory (rather than localStorage) protects against XSS token exfiltration.
 * Long-term session persistence is safely handled by the HttpOnly refreshToken cookie.
 */

let accessToken = null;
const listeners = new Set();

/**
 * Retrieve the current access token.
 * @returns {string|null}
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Store or update the access token in memory.
 * @param {string|null} token
 */
export function setAccessToken(token) {
  accessToken = token || null;
  listeners.forEach((listener) => {
    try {
      listener(accessToken);
    } catch {
      // Ignore listener errors
    }
  });
}

/**
 * Clear the in-memory access token.
 */
export function clearAccessToken() {
  setAccessToken(null);
}

/**
 * Subscribe to token changes.
 * @param {(token: string|null) => void} listener
 * @returns {() => void} Unsubscribe function
 */
export function onTokenChange(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
