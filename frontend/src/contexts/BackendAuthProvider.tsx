import React, { useState, useEffect, useCallback } from "react";
import { BackendAuthContext } from "./BackendAuthContext";
import type { BackendAuthContextType, User } from "./BackendAuthTypes";

export const BackendAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);

  const saveToken = useCallback((t: string | null) => {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
    setToken(t);
  }, []);

  const fetchMe = useCallback(async (t?: string) => {
    const tok = t ?? token;
    if (!tok) { setUser(null); setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${tok}` } });
      if (!res.ok) { saveToken(null); setUser(null); return; }
      const u: User = await res.json();
      setUser(u);
    } catch { saveToken(null); setUser(null); }
    finally { setIsLoading(false); }
  }, [token, API_URL, saveToken]);

  useEffect(() => {
    if (token) fetchMe();
    else setIsLoading(false);
  }, [token, fetchMe]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Login failed");
    }
    const body = await res.json();
    saveToken(body.token);
    await fetchMe(body.token);
  };

  const register = async (email: string, password: string, role = "GUEST") => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Registration failed");
    }
    const body = await res.json();
    saveToken(body.token);
    await fetchMe(body.token);
  };

  const logout = () => { saveToken(null); setUser(null); };

  const value: BackendAuthContextType = { 
    user, 
    token, 
    isAuthenticated: !!user && !isLoading, 
    isLoading, 
    login, 
    register, 
    logout, 
    refreshUser: fetchMe 
  };

  return <BackendAuthContext.Provider value={value}>{children}</BackendAuthContext.Provider>;
};