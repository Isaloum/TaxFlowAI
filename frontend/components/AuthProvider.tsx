'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { APIClient } from '@/lib/api-client';
import api from '@/lib/api-client';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Primary: verify via HttpOnly cookie (works even if localStorage is cleared)
      const res = await APIClient.getMe();
      setUser(res.data.user);
    } catch {
      // Fallback: read from localStorage (backward compat for existing sessions)
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('auth_user_accountant') 
          || localStorage.getItem('auth_user_client')
          || localStorage.getItem('auth_user');
        if (userData) {
          try { setUser(JSON.parse(userData)); } catch {}
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await APIClient.login(email, password);
    setUser(data.user);
    if (data.user.role === 'client' && data.user.isFirstLogin) {
      router.push('/client/change-password');
    } else {
      router.push(data.user.role === 'accountant' ? '/accountant/dashboard' : '/client/dashboard');
    }
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    // Clear all localStorage auth keys
    ['auth_token', 'auth_user', 'auth_token_accountant', 'auth_user_accountant', 
     'auth_token_client', 'auth_user_client'].forEach(k => localStorage.removeItem(k));
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
