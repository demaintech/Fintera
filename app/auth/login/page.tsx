"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";

const LoginPage = () => {
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

        <form className="mt-8 space-y-6">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm font-medium text-foreground/80 hover:text-white transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            Login <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-foreground/70">
          Don't have an account? <Link href="/auth/signup" className="font-semibold text-white hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </main>
  );
};

export default LoginPage;