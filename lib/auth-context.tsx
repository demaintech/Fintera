"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { isValidPassword } from "./validation";

interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  role?: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ token: string; user: User }>;
  signup: (fullname: string, email: string, password: string) => Promise<{ token: string; user: User }>;
  updateProfile: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

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

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fintera-aquaculture-bckend.onrender.com";

  const login = async (email: string, password: string) => {
    const loginIdentifier = email.trim();
    const normalizedEmail = normalizeEmail(email);

    const formData = new URLSearchParams();
    formData.append("username", loginIdentifier);
    formData.append("email", normalizedEmail);
    formData.append("password", password);

    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      credentials: "include",
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

      const normalizedErrorMessage = errorMessage.toLowerCase();
      if (
        normalizedErrorMessage.includes("credential") ||
        normalizedErrorMessage.includes("authentication") ||
        normalizedErrorMessage.includes("incorrect") ||
        normalizedErrorMessage.includes("user not found") ||
        response.status === 401
      ) {
        const error = new Error("Incorrect email or password.");
        (error as any).status = 401;
        throw error;
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    const authToken = data.access_token || data.token;

    let storedName: string | undefined;
    try {
      const storedUserRaw = localStorage.getItem("user");
      if (storedUserRaw) {
        const storedUser = JSON.parse(storedUserRaw);
        if (storedUser?.email === email.trim() && storedUser?.name) {
          storedName = storedUser.name;
        }
      }
    } catch (_) {}

    const extractNameFromEmail = (emailStr: string) => {
      const parts = emailStr.split("@")[0].split(".");
      return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
    };

    let loggedInUser: User = {
      id: "unknown",
      email: normalizedEmail,
      username: normalizedEmail,
      name: storedName || extractNameFromEmail(normalizedEmail),
      role: "admin",
    };

    if (authToken) {
      const decoded = decodeJwt(authToken);
      if (decoded && decoded.sub) {
        loggedInUser = {
          id: decoded.sub,
          email: decoded.sub.includes("@") ? decoded.sub : normalizedEmail,
          username: decoded.sub,
          name: storedName || extractNameFromEmail(email.trim()),
          role: "admin",
        };
      }
      localStorage.setItem("token", authToken);
      setToken(authToken);
    } else {
      const sessionMarker = `session_${Date.now()}`;
      localStorage.setItem("token", sessionMarker);
      setToken(sessionMarker);
    }

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return { token: authToken || "session", user: loggedInUser };
  };

  const signup = async (fullname: string, email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const payload = {
      fullname: fullname.trim(),
      email: normalizedEmail,
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
          const firstDetail = data.detail[0];
          errorMessage = typeof firstDetail === "string"
            ? firstDetail
            : firstDetail?.msg ?? "Signup failed";
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
      email: normalizedEmail,
      username: normalizedEmail,
      name: fullname.trim(),
      role: "admin",
    };

    const decoded = decodeJwt(authToken);
    if (decoded && decoded.sub) {
      signedUpUser = {
        id: decoded.sub,
        email: decoded.sub.includes("@") ? decoded.sub : normalizedEmail,
        username: decoded.sub,
        name: fullname.trim(),
        role: "admin",
      };
    }

    if (authToken) {
      localStorage.setItem("token", authToken);
    }
    localStorage.setItem("user", JSON.stringify(signedUpUser));
    setUser(signedUpUser);

    return { token: authToken || "", user: signedUpUser };
  };

  const updateProfile = async (name: string) => {
    const trimmedName = name.trim();
    if (!user) {
      throw new Error("You must be signed in to update your profile.");
    }

    const updatedUser: User = {
      ...user,
      name: trimmedName,
    };

    try {
      await fetch(`${apiUrl}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: trimmedName, email: user.email }),
      });
    } catch {
      // Fallback local update
    }

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    if (!user) {
      throw new Error("You must be signed in to change your password.");
    }

    if (!isValidPassword(trimmedNewPassword)) {
      throw new Error("New password must be at least 8 characters and include upper, lower, and numeric characters.");
    }

    await fetch(`${apiUrl}/users/me/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ currentPassword: trimmedCurrentPassword, newPassword: trimmedNewPassword }),
    });
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
        updateProfile,
        changePassword,
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