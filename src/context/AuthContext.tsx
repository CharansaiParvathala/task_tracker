import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/auth';
import { User, UserRole } from '../lib/types';
import { getCurrentUser, logoutUser } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
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

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.login(email, password);
      if (result.user) {
        setUser(result.user);
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
      await authService.signup(email, password, name, role);
      await login(email, password);
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
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(email, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPredefinedRoles = () => [
    { value: 'admin', label: 'Administrator' },
    { value: 'checker', label: 'Checker' },
    { value: 'owner', label: 'Owner' },
    { value: 'leader', label: 'Leader' }
  ];

  const value = {
    user,
    loading,
    error,
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