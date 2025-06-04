import * as React from 'react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../lib/auth';
import { User, UserRole } from '../lib/types';
import { getCurrentUser, logoutUser } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  getPredefinedRoles: () => { value: UserRole; label: string }[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isInitialMount = useRef(true);
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Check for existing session on mount and periodically
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        if (!user || user.id !== currentUser.id) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } else if (user && !isInitialMount.current) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    // Initial check
    checkAuth();
    setLoading(false);
    isInitialMount.current = false;

    // Set up periodic check
    sessionCheckInterval.current = setInterval(checkAuth, 5000);

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, []); // Empty dependency array to run only on mount

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setError(result.error || 'Login failed');
        throw new Error(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.signup(email, password, name, role);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setError(result.error || 'Signup failed');
        throw new Error(result.error || 'Signup failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.resetPassword(email, newPassword);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setError(result.error || 'Password reset failed');
        throw new Error(result.error || 'Password reset failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPredefinedRoles = () => [
    { value: 'admin' as UserRole, label: 'Administrator' },
    { value: 'checker' as UserRole, label: 'Checker' },
    { value: 'owner' as UserRole, label: 'Owner' },
    { value: 'leader' as UserRole, label: 'Leader' }
  ];

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    resetPassword,
    getPredefinedRoles
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 