"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, User, Lock, ArrowRight } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/lib/auth-context";
import { sanitizeInput, isValidEmail, isValidUsername, getErrorMessage } from "@/lib/validation";

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateInputs = (): boolean => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return false;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setError("Please enter your password");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);

      await login(sanitizedEmail, sanitizedPassword);

      toast.success("Login successful! Redirecting you...", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (err: any) {
      console.error("Login error:", err);
      
      const status = err.status || 500;
      const errorMsg = getErrorMessage(status, err.message || "Login failed. Please try again.");
      setError(errorMsg);

      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-[-1]">
        <Image
          src="/assets/images/signup.jpg"
          alt="Fish jumping out of the ocean"
          layout="fill"
          objectFit="cover"
          quality={90}
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Login Form Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-white/20 bg-background/30 p-8 shadow-2xl backdrop-blur-lg"
      >
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-foreground/80">
            Login to manage your aquaculture operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Error Message Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50 transition-all duration-300" />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={isLoading}
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={isLoading}
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-foreground/80 hover:text-white transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              <>
                Login <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-foreground/70">
          Don't have an account? <Link href="/auth/signup" className="font-semibold text-white hover:underline">Sign Up</Link>
        </p>
      </motion.div>
      <ToastContainer />
    </main>
  );
};

export default LoginPage;