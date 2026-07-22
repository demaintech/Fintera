"use client";

import { Search, Bell, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import MobileNav from "./MobileNav";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import CommandPalette from "./CommandPalette";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Extract name from email if name field is not available
  const extractNameFromEmail = (emailStr: string) => {
    const parts = emailStr.split("@")[0].split(".");
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  };

  // Derive first name from user's full name or email
  const getFirstName = () => {
    if (user?.name && user.name.trim()) {
      return user.name.trim().split(" ")[0];
    }
    if (user?.email) {
      return extractNameFromEmail(user.email).split(" ")[0];
    }
    return "User";
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    router.push("/admin/settings");
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <header className="w-full flex h-20 items-center justify-between px-4 sm:px-6 bg-background border-b border-border/40 border-gray-500">
      {/* Mobile Nav Trigger */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1">
        <h1 className="text-lg font-semibold text-foreground/90 sm:text-xl hidden md:block">
          Welcome, {getFirstName()}
        </h1>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="relative flex-1 max-w-md ml-2 sm:ml-0 h-10 w-full rounded-lg border border-border bg-background text-sm text-muted-foreground hover:bg-accent transition-colors flex items-center px-3"
        >
          <Search className="h-5 w-5 mr-3" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Header Actions */}
      <CommandPalette open={isSearchOpen} setOpen={setIsSearchOpen} />
      <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-4">
        <ThemeToggle />
        <button
          aria-label="Notifications"
          className="h-9 w-9 flex items-center justify-center rounded-full text-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            aria-label="User Profile"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="h-9 w-9 flex items-center justify-center rounded-full text-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-500 bg-background backdrop-blur-3xl p-2 shadow-lg z-50">
              <div className="px-3 py-2">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="mt-1 text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
              <div className="my-2 h-px bg-border" />
              <button
                onClick={handleProfileClick}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="mt-1 flex w-full items-center rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
