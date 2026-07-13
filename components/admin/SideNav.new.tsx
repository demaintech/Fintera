"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fish,
  LayoutDashboard,
  Droplets,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Warehouse,
  NotebookPen,
} from "lucide-react";
import { useState } from "react";

const navSections = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Ponds",
        icon: Droplets,
        children: [
          { href: "/admin/ponds", label: "All Ponds" },
          { href: "/admin/ponds/new", label: "Add Pond" },
        ],
      },
      {
        label: "Inventory",
        icon: Warehouse,
        children: [
          { href: "/admin/inventory", label: "Stock Overview" },
          { href: "/admin/inventory/feeds", label: "Feeds" },
        ],
      },
    ],
  },
  {
    title: "Insights",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/reports", label: "Reports", icon: NotebookPen },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const SideNav = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>("Ponds");

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <aside className="hidden w-72 flex-col border-r border-border/40 bg-background md:flex">
      <div className="flex h-20 items-center border-b border-border/40 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Fish className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold">Fintera</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-4 px-4 py-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <div className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {section.title}
            </div>

            {section.items.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isActive =
                pathname === item.href || item.children?.some((child) => pathname === child.href);

              if (hasChildren) {
                const isOpen = openDropdown === item.label;
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </span>
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    {isOpen && (
                      <div className="ml-5 space-y-1 border-l border-border/40 pl-3">
                        {item.children?.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block rounded-md px-3 py-2 text-sm transition-all ${
                                childActive ? "text-primary" : "text-foreground/60 hover:text-foreground"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-lg border border-border/40 bg-muted/40 px-4 py-3 text-sm text-foreground/70">
          Ready for your next operation
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
