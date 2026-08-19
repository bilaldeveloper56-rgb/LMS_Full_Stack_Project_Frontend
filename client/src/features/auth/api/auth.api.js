import api from '@/config/api';

/**
 * Authentication API Service.
 * Matches backend routes mounted at /api/v1/auth.
 */

/**
 * Log in with email and password.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: object, accessToken: string }>}
 */
export async function loginApi({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
}

/**
 * Refresh access token using the HttpOnly cookie.
 * @returns {Promise<{ accessToken: string }>}
 */
export async function refreshTokenApi() {
  const response = await api.post('/auth/refresh-token');
  return response.data.data;
}

/**
 * Log out and invalidate the refresh token on the server.
 * @returns {Promise<void>}
 */
export async function logoutApi() {
  const response = await api.post('/auth/logout');
  return response.data;
}

/**
 * Get current authenticated user profile.
 * @returns {Promise<{ user: object }>}
 */
export async function getMeApi() {
  const response = await api.get('/auth/me');
  return response.data.data;
}

/**
 * Update current user profile.
 * @param {{ firstName?: string, lastName?: string, phone?: string }} profileData
 * @returns {Promise<{ user: object }>}
 */
export async function updateProfileApi(profileData) {
  const response = await api.patch('/auth/me', profileData);
  return response.data.data;
}

/**
 * Change current user password.
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} payload
 * @returns {Promise<void>}
 */
export async function changePasswordApi(payload) {
  const response = await api.post('/auth/change-password', payload);
  return response.data;
}

/**
 * Request a password reset link.
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function forgotPasswordApi(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

/**
 * Reset password using a reset token.
 * @param {{ token: string, password: string, confirmPassword: string }} payload
 * @returns {Promise<void>}
 */
export async function resetPasswordApi(payload) {
  const response = await api.post('/auth/reset-password', payload);
  return response.data;
}

/**
 * Verify email address with a token.
 * @param {string} token
 * @returns {Promise<{ user: object }>}
 */
export async function verifyEmailApi(token) {
  const response = await api.post('/auth/verify-email', { token });
  return response.data.data;
}

/**
 * Resend email verification link.
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function resendVerificationApi(email) {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
}
