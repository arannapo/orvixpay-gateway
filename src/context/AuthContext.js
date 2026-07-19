"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      const isDashboardPath = pathname?.startsWith('/dashboard');
      const isAdminPath = pathname?.startsWith('/admin');

      if ((isDashboardPath || isAdminPath) && !user) {
        router.push('/login');
      } else if ((pathname === '/login' || pathname === '/register') && user) {
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else if (isAdminPath && user && user.role !== 'admin') {
        router.push('/dashboard');
      } else if (isDashboardPath && user && user.role === 'admin') {
        router.push('/admin');
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth, loading }}>
      {!loading ? children : <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
