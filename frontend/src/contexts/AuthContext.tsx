'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const email = localStorage.getItem('userEmail');
        
        if (token && email) {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            setIsAuthenticated(true);
            setUserEmail(email);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('isLoggedIn');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear storage on error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isLoggedIn');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Redirect logic
    if (!loading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, pathname, router]);

  const login = (email: string, token: string) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isLoggedIn', 'true');
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
    setUserEmail(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userEmail,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
