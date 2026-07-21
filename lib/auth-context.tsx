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
  signup: (fullname: string, email: string, password: string) => Promise<{ token: string; user: User }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT JSON web token payload on client side
const decodeJwt = (jwtToken: string) => {
  try {
    const base64Url = jwtToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

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

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email.trim());
    formData.append("password", password);

    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = "Login failed";
      if (data && data.detail) {
        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          errorMessage = data.detail.map((d: any) => d.msg).join(", ");
        }
      } else if (data && (data.message || data.error)) {
        errorMessage = data.message || data.error;
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    // Try to get token from response body (JWT-based) or fall back to session marker (cookie-based)
    const authToken = data.access_token || data.token;

    // Recover any previously stored name (e.g. set during signup) to show correct greeting
    let storedName: string | undefined;
    try {
      const storedUserRaw = localStorage.getItem("user");
      if (storedUserRaw) {
        const storedUser = JSON.parse(storedUserRaw);
        // Only reuse the name if the email matches (same account)
        if (storedUser?.email === email.trim() && storedUser?.name) {
          storedName = storedUser.name;
        }
      }
    } catch (_) {}

    let loggedInUser: User = {
      id: "unknown",
      email: email.trim(),
      username: email.trim(),
      name: storedName,
      role: "admin",
    };

    if (authToken) {
      // JWT-based auth: decode and store token
      const decoded = decodeJwt(authToken);
      if (decoded && decoded.sub) {
        loggedInUser = {
          id: decoded.sub,
          email: decoded.sub.includes("@") ? decoded.sub : email.trim(),
          username: decoded.sub,
          name: storedName || decoded.sub,
          role: "admin",
        };
      }
      localStorage.setItem("token", authToken);
      setToken(authToken);
    } else {
      // Cookie/session-based auth: backend returned 200 OK but no token body.
      // Store a session marker so the AdminGuard treats the user as authenticated.
      const sessionMarker = `session_${Date.now()}`;
      localStorage.setItem("token", sessionMarker);
      setToken(sessionMarker);
    }

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return { token: authToken || "session", user: loggedInUser };
  };

  const signup = async (fullname: string, email: string, password: string) => {
    const payload = {
      fullname: fullname.trim(),
      email: email.trim(),
      password: password,
    };

    const response = await fetch(`${apiUrl}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = "Signup failed";
      if (data && data.detail) {
        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail.length > 0) {
          errorMessage = data.detail.map((d: any) => d.msg).join(", ");
        }
      } else if (data && (data.message || data.error)) {
        errorMessage = data.message || data.error;
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    const authToken = data.access_token || data.token;
    if (authToken) {
      localStorage.setItem("token", authToken);
      setToken(authToken);
    }
    
    let signedUpUser: User = {
      id: "unknown",
      email: email.trim(),
      username: email.trim(),
      name: fullname.trim(),
      role: "admin",
    };

    const decoded = decodeJwt(authToken);
    if (decoded && decoded.sub) {
      signedUpUser = {
        id: decoded.sub,
        email: decoded.sub.includes("@") ? decoded.sub : email.trim(),
        username: decoded.sub,
        name: fullname.trim(),
        role: "admin",
      };
    }

    localStorage.setItem("user", JSON.stringify(signedUpUser));
    setUser(signedUpUser);

    return { token: authToken || "", user: signedUpUser };
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
