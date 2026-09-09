import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Role, LoginPayload, RegisterPayload } from '../types/auth.types';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  checkAuthSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => tokenStorage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!tokenStorage.getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuthSession = useCallback(async (): Promise<boolean> => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        tokenStorage.clearAuth();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
    } catch {
      tokenStorage.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkAuthSession();

    const handleSessionExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    window.addEventListener('queueless:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('queueless:session-expired', handleSessionExpired);
    };
  }, [checkAuthSession]);

  const login = async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.login(payload);
      setUser(response.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return response.user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await authService.register(payload);
      setUser(response.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      return response.user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
