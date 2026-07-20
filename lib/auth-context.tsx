"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ token: string; user: User }>;
  signup: (name: string, email: string, password: string) => Promise<{ token: string; user: User }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const login = async (emailOrUsername: string, password: string) => {
    const isEmail = emailOrUsername.includes("@");

    const payload = {
      usernameOrEmail: emailOrUsername.trim(),
      identifier: emailOrUsername.trim(),
      email: isEmail ? emailOrUsername.trim() : undefined,
      username: !isEmail ? emailOrUsername.trim() : undefined,
      password: password,
    };

    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error || "Login failed";
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }

    return { token: data.token, user: data.user };
  };

  const signup = async (name: string, email: string, password: string) => {
    const payload = {
      name: name.trim(),
      email: email.trim(),
      password: password,
    };

    const response = await fetch(`${apiUrl}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error || "Signup failed";
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    // Yes, token should come from signup too
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }

    return { token: data.token, user: data.user };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
