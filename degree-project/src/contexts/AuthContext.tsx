import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { apiClient, User } from "../services/api";

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

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<User>("/users/me");
      setUser(response.data);
    } catch (error: any) {
      if (!navigator.onLine) {
        console.warn("Offline: Unable to fetch user.");
      } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (token && !user) fetchUser();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [token, user, fetchUser, isOnline]);

  useEffect(() => {
    if (token && isLoading) {
      fetchUser();
    } else if (!token) {
      setUser(null);
      setIsLoading(false);
    }
  }, [token, isLoading, fetchUser]);

  const login = useCallback(async (newToken: string) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    setIsLoading(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
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
    fetchUser,
  }), [isAuthenticated, user, token, isLoading, isOnline, login, logout, fetchUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
