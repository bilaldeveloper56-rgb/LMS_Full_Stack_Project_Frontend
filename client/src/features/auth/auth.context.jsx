import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginApi,
  logoutApi,
  refreshTokenApi,
  getMeApi,
} from './api/auth.api';
import { setAccessToken, clearAccessToken } from './auth.token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restore user session on app launch.
   * Attempts to obtain a fresh access token using the HttpOnly refresh cookie,
   * then fetches the authenticated user profile.
   */
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const refreshData = await refreshTokenApi();
        if (refreshData?.accessToken) {
          setAccessToken(refreshData.accessToken);
          const userData = await getMeApi();
          if (isMounted && userData?.user) {
            setUser(userData.user);
          }
        }
      } catch {
        // No active session or refresh token expired — cleanly state unauthenticated
        if (isMounted) {
          setUser(null);
          clearAccessToken();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in with credentials.
   */
  const login = useCallback(async ({ email, password }) => {
    const data = await loginApi({ email, password });
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
    if (data?.user) {
      setUser(data.user);
    }
    return data?.user;
  }, []);

  /**
   * Log out of current session.
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Proceed with local state cleanup even if network fails
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  /**
   * Manually trigger session refresh.
   */
  const refresh = useCallback(async () => {
    try {
      const refreshData = await refreshTokenApi();
      if (refreshData?.accessToken) {
        setAccessToken(refreshData.accessToken);
        const userData = await getMeApi();
        if (userData?.user) {
          setUser(userData.user);
          return userData.user;
        }
      }
      return null;
    } catch (error) {
      clearAccessToken();
      setUser(null);
      throw error;
    }
  }, []);

  /**
   * Update local user state (e.g. after profile edit).
   */
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refresh,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
