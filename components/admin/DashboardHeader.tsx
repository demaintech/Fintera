"use client";

import { Search, Bell, UserCircle } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

const DashboardHeader = () => {
  return (
    <header className="flex h-20 items-center justify-between px-6 bg-background border-b border-border/40">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
        <input
          type="search"
          placeholder="Search ponds, data, reports..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
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