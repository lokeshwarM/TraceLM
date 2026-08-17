'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken, removeToken, setToken } from './auth';
import { getMe } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  login: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
  login: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }
      
      try {
        const userData = await getMe();
        if (isMounted) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (isMounted) {
          removeToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []); // Run only on mount

  const login = async (token: string) => {
    setToken(token);
    setIsLoading(true);
    try {
      const userData = await getMe();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      removeToken();
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  // Auth Guard
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = pathname === '/login' || pathname === '/';
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/chat');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
