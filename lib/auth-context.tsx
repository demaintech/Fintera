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

interface RegisteredUser {
  email: string;
  password: string;
  name?: string;
}

const getRegisteredUsers = (): RegisteredUser[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem("registeredUsers");
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveRegisteredUsers = (users: RegisteredUser[]) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("registeredUsers", JSON.stringify(users));
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

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
    const storedPassword = localStorage.getItem("userPassword");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (storedPassword) {
          parsedUser.password = storedPassword;
        }
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userPassword");
      }
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        const existingUsers = getRegisteredUsers();
        const normalizedEmail = normalizeEmail(parsedUser.email);
        const alreadyRegistered = existingUsers.some((registeredUser) => normalizeEmail(registeredUser.email) === normalizedEmail);
        if (!alreadyRegistered && parsedUser.email && storedPassword) {
          saveRegisteredUsers([
            ...existingUsers,
            {
              email: normalizedEmail,
              password: storedPassword,
              name: parsedUser.name,
            },
          ]);
        }
      } catch {
        // Ignore initialization issues and continue.
      }
    }

    setIsLoading(false);
  }, []);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const login = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const storedUserRaw = localStorage.getItem("user");
    const storedPassword = localStorage.getItem("userPassword");
    const registeredUsers = getRegisteredUsers();
    const isKnownAccount = registeredUsers.some((registeredUser) => normalizeEmail(registeredUser.email) === normalizedEmail && registeredUser.password === password);
    const isStoredSessionMatch = Boolean(
      storedUserRaw &&
      storedPassword &&
      normalizeEmail(JSON.parse(storedUserRaw).email || "") === normalizedEmail &&
      storedPassword === password
    );

    if (!isKnownAccount && !isStoredSessionMatch) {
      throw new Error("No account found for this email and password.");
    }

    const formData = new URLSearchParams();
    formData.append("username", normalizedEmail);
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

    // Extract name from email prefix if stored name isn't available
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
      password,
    };

    if (authToken) {
      // JWT-based auth: decode and store token
      const decoded = decodeJwt(authToken);
      if (decoded && decoded.sub) {
        loggedInUser = {
          id: decoded.sub,
          email: decoded.sub.includes("@") ? decoded.sub : normalizedEmail,
          username: decoded.sub,
          name: storedName || extractNameFromEmail(email.trim()),
          role: "admin",
          password,
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

    const existingUsers = getRegisteredUsers();
    const updatedUsers = existingUsers.filter((registeredUser) => normalizeEmail(registeredUser.email) !== normalizedEmail);
    updatedUsers.push({
      email: normalizedEmail,
      password,
      name: loggedInUser.name,
    });
    saveRegisteredUsers(updatedUsers);

    localStorage.setItem("userPassword", password);
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
      email: normalizedEmail,
      username: normalizedEmail,
      name: fullname.trim(),
      role: "admin",
      password,
    };

    const decoded = decodeJwt(authToken);
    if (decoded && decoded.sub) {
      signedUpUser = {
        id: decoded.sub,
        email: decoded.sub.includes("@") ? decoded.sub : normalizedEmail,
        username: decoded.sub,
        name: fullname.trim(),
        role: "admin",
        password,
      };
    }

    const existingUsers = getRegisteredUsers();
    const updatedUsers = existingUsers.filter((registeredUser) => normalizeEmail(registeredUser.email) !== normalizedEmail);
    updatedUsers.push({
      email: normalizedEmail,
      password,
      name: fullname.trim(),
    });
    saveRegisteredUsers(updatedUsers);

    localStorage.setItem("userPassword", password);
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
      password: user.password ?? localStorage.getItem("userPassword") ?? undefined,
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
      // Fall back to local persistence when the backend does not expose a profile endpoint yet.
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

    const storedPassword = localStorage.getItem("userPassword");
    if (storedPassword !== trimmedCurrentPassword) {
      throw new Error("The current password you entered is incorrect.");
    }

    if (!isValidPassword(trimmedNewPassword)) {
      throw new Error("New password must be at least 8 characters and include upper, lower, and numeric characters.");
    }

    const updatedUser: User = {
      ...user,
      password: trimmedNewPassword,
    };

    try {
      await fetch(`${apiUrl}/users/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword: trimmedCurrentPassword, newPassword: trimmedNewPassword }),
      });
    } catch {
      // Fall back to local persistence when the backend does not expose a password endpoint yet.
    }

    localStorage.setItem("userPassword", trimmedNewPassword);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userPassword");
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
