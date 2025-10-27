import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "opentee_auth";

export interface AuthData {
  username: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: AuthData;
  login: (data: { username: string; email: string; token: string }) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthData>({
    username: "",
    email: "",
    token: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuth({
          username: parsed.username || "",
          email: parsed.email || "",
          token: parsed.token || "",
        });
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (auth?.token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  const login = (data: { username: string; email: string; token: string }) => {
    setAuth(data);
  };

  const logout = () => {
    setAuth({ username: "", email: "", token: "" });
  };

  const isLoggedIn = Boolean(auth.token);

  const value: AuthContextType = { user: auth, login, logout, isLoggedIn };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
