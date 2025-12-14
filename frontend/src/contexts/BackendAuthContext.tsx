import React, { createContext, useContext, useEffect, useState } from "react";

type Person = {
  id: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string | null;
};

export type User = {
  id: string;
  email: string;
  role: string;
  personId?: string | null;
  person?: Person | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const BackendAuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const BackendAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);

  const saveToken = (t: string | null) => {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
    setToken(t);
  };

  const fetchMe = async (t?: string) => {
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
      const u = await res.json();
      setUser(u);
    } catch (err) {
      console.error("fetchMe error", err);
      setUser(null);
      saveToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMe();
    else setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const register = async (email: string, password: string, role = "GUEST") => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ error: "Registration failed" }));
      throw new Error(err.error || "Registration failed");
    }

    const body = await res.json();
    saveToken(body.token);
    await fetchMe(body.token);
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
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

export const useBackendAuth = (): AuthContextType => {
  const ctx = useContext(BackendAuthContext);
  if (!ctx)
    throw new Error("useBackendAuth must be used within BackendAuthProvider");
  return ctx;
};

export default BackendAuthContext;
