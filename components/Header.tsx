"use client";

import React from "react";
import Link from "next/link";
import { Fish } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NavBar from "./NavBar";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/75 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Fish className="h-6 w-6" />
          <span className="font-bold text-xl">Fintera</span>
        </Link>

        <div className="hidden md:flex">
          <NavBar />
        </div>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="hidden sm:inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            Login
          </Link>
          <Link href="/auth/signup" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            Sign Up
          </Link>
          <ThemeToggle />
          {/* Add a Mobile Menu button here for smaller screens if needed */}
        </div>
      </div>
    </header>
  );
};

export default Header;