import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { apiClient, type User } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isOnline: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthHook = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthHook must be used within an AuthProvider');
  }
  return context;
};


interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
        console.log('Network status: Online');
        setIsOnline(true);
        if (token && !user) {
           fetchUser();
        }
    };
    const handleOffline = () => {
        console.log('Network status: Offline');
        setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    console.log('Attempting to fetch user...');

    try {
      const response = await apiClient.get<User>('/users/me');
      console.log('User data fetched successfully:', response.data);
      setUser(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      if (!navigator.onLine) {
        console.warn('Fetch user failed due to offline status. Keeping existing token/auth state.');
      } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
         console.log('Token invalid or expired. Logging out.');
         setToken(null);
         setUser(null);
         localStorage.removeItem('authToken');
      } else {
          console.error('An unexpected error occurred fetching user data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
     if (token && isLoading) {
        fetchUser();
     } else if (!token) {
         setIsLoading(false);
         setUser(null);
     }
  }, [token, isLoading, fetchUser]);

  const login = useCallback(async (newToken: string) => {
    console.log('Login successful, setting token.');
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setIsLoading(true);
  }, []);

  const logout = useCallback(() => {
    console.log('Logging out.');
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => !!token, [token]);

  const value = useMemo(() => ({
    isAuthenticated,
    user,
    token,
    isLoading,
    isOnline,
    login,
    logout,
    fetchUser
  }), [isAuthenticated, user, token, isLoading, isOnline, login, logout, fetchUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};