import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthTokenGetter } from '@/api-client-react';
import { customFetch } from '@/api-client-react/custom-fetch';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('memorize_access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('memorize_refresh_token'));
  const [loading, setLoading] = useState(true);

  // Configure API client to use the access token
  useEffect(() => {
    setAuthTokenGetter(() => accessToken);
  }, [accessToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('memorize_access_token');
    localStorage.removeItem('memorize_refresh_token');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    if (!refreshToken) return logout();
    try {
      const data = await customFetch('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      });
      localStorage.setItem('memorize_access_token', data.accessToken);
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (err) {
      logout();
      return null;
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const data = await customFetch('/api/auth/me');
          setUser(data);
        } catch (err) {
          if (err.status === 401) {
            // Try refreshing
            const newToken = await refreshSession();
            if (newToken) {
              try {
                const retryData = await customFetch('/api/auth/me');
                setUser(retryData);
              } catch (retryErr) {
                console.error("Auth retry error", retryErr);
              }
            }
          } else {
            console.error("Auth init error", err);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [accessToken, refreshSession]);

  const login = useCallback((authData) => {
    localStorage.setItem('memorize_access_token', authData.accessToken);
    localStorage.setItem('memorize_refresh_token', authData.refreshToken);
    setAccessToken(authData.accessToken);
    setRefreshToken(authData.refreshToken);
    setUser(authData.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
