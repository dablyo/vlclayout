import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) return null;
    return { username: payload.username, isAdmin: payload.isAdmin };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    return t ? decodeToken(t) : null;
  });
  const [adminInitialized, setAdminInitialized] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      const decoded = decodeToken(token);
      setUser(decoded);
      if (!decoded) {
        setToken(null);
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    apiFetch('/api/auth/admin-status')
      .then((data) => setAdminInitialized(data.initialized))
      .catch(() => setAdminInitialized(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
  }, []);

  const register = useCallback(async (username, password) => {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
  }, []);

  const adminInit = useCallback(async (password) => {
    const data = await apiFetch('/api/auth/admin-init', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    setToken(data.token);
    setAdminInitialized(true);
  }, []);

  const changePassword = useCallback(async (newPassword) => {
    await apiFetch('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        adminInitialized,
        login,
        register,
        adminInit,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
