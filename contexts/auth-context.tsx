"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get user from localStorage
  const getUserFromStorage = useCallback((): User | null => {
    if (typeof window === "undefined") return null;
    
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      
      const userData = JSON.parse(userStr) as User;
      return userData;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }, []);

  // Check if user is authenticated
  const checkAuth = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    
    const accessToken = localStorage.getItem("accessToken");
    const userData = getUserFromStorage();
    
    return !!accessToken && !!userData;
  }, [getUserFromStorage]);

  // Refresh user data from localStorage
  const refreshUser = useCallback(() => {
    const userData = getUserFromStorage();
    setUser(userData);
  }, [getUserFromStorage]);

  // Login function
  const login = useCallback((userData: User, tokens: { accessToken: string; refreshToken: string }) => {
    if (typeof window === "undefined") return;
    
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    
    setUser(userData);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    
    // Clear all auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    
    // Clear state
    setUser(null);
    
    // Redirect to login
    router.push("/login");
  }, [router]);

  // Initialize user data on mount
  useEffect(() => {
    setIsLoading(true);
    const userData = getUserFromStorage();
    setUser(userData);
    setIsLoading(false);
  }, [getUserFromStorage]);

  const isAuthenticated = checkAuth();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}