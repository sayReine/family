/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback } from "react";
import type { BackendAuthContextType, User } from "./BackendAuthTypes";
import type { ProfileContextType } from "./ProfileContextTypes";

// Context creation
export const BackendAuthContext = createContext<BackendAuthContextType | undefined>(undefined);

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);


// Provider component
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);

  // Save token in localStorage and state
  const saveToken = (t: string | null) => {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
    setToken(t);
  };

  // Fetch current user
  const fetchMe = useCallback(async (t?: string) => {
    const tok = t ?? token;
    if (!tok) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      if (!res.ok) {
        saveToken(null);
        setUser(null);
        return;
      }
      const data: User = await res.json();
      setUser(data);
    } catch {
      saveToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, API_URL]);

  // On mount, fetch user if token exists
  useEffect(() => {
    if (token) fetchMe();
    else setIsLoading(false);
  }, [token, fetchMe]);

  // Login
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(err.error || "Login failed");
    }

    const body = await res.json();
    saveToken(body.token);
    await fetchMe(body.token);
  };

  // Register
  const register = async (email: string, password: string, role = "GUEST") => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Registration failed" }));
      throw new Error(err.error || "Registration failed");
    }

    const body = await res.json();
    saveToken(body.token);
    await fetchMe(body.token);
  };

  // Logout
  const logout = () => {
    saveToken(null);
    setUser(null);
  };

  const value: BackendAuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !isLoading,
    isLoading,
    login,
    register,
    logout,
    refreshUser: fetchMe,
  };

  return (
    <BackendAuthContext.Provider value={value}>
      {children}
    </BackendAuthContext.Provider>
  );
};