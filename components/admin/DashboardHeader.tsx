"use client";

import { Search, Bell, UserCircle } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import MobileNav from "./MobileNav";
import { useAuth } from "@/lib/auth-context";

const DashboardHeader = () => {
  const { user } = useAuth();

  // Derive first name: prefer stored name, then email prefix, then fallback
  const getFirstName = () => {
    if (user?.name && user.name.trim()) {
      return user.name.trim().split(" ")[0];
    }
    if (user?.email) {
      // Extract the part before @ and capitalise it
      const prefix = user.email.split("@")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return "Admin";
  };

  return (
    <header className="w-full flex h-20 items-center justify-between px-4 sm:px-6 bg-background border-b border-border/40">
      {/* Mobile Nav Trigger */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1">
        <h1 className="text-lg font-semibold text-foreground/90 sm:text-xl hidden md:block">
          Welcome, {getFirstName()}
        </h1>

        <div className="relative flex-1 max-w-md ml-2 sm:ml-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
          <input
            type="search"
            placeholder="Search ponds, data, reports..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-4">
        <ThemeToggle />
        <button
          aria-label="Notifications"
          className="h-9 w-9 flex items-center justify-center rounded-full text-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          aria-label="User Profile"
          className="h-9 w-9 flex items-center justify-center rounded-full text-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <UserCircle className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;

