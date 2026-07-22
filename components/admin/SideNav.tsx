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
  NotebookPen,
  Waves,
  Package,
  UtensilsCrossed,
  Boxes,
  CircleDollarSign,
  ChartColumnIncreasing,
} from "lucide-react";
import { useState } from "react";

type NavItem =
  | {
      href: string;
      label: string;
      icon: typeof LayoutDashboard;
    }
  | {
      label: string;
      icon: typeof Droplets;
      children: Array<{ href: string; label: string }>;
    };

export const navSections = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Pond Management",
        icon: Waves,
        children: [
          { href: "/admin/ponds", label: "All Ponds" },
          { href: "/admin/ponds/new", label: "Add Pond" },
          // { href: "/admin/ponds/info", label: "Pond Details" },
        ],
      },
      {
        label: "Stock Management",
        icon: Package,
        children: [
          { href: "/admin/stock", label: "Stocking Records" },
          // { href: "/admin/stock/species", label: "Species Management" },
          // { href: "/admin/stock/history", label: "Stocking History" },
          { href: "/admin/stock/mortality", label: "Mortality Records" },
          { href: "/admin/stock/harvest", label: "Harvest Records" },
        ],
      },
      {
        label: "Feeding",
        icon: UtensilsCrossed,
        children: [
          { href: "/admin/feeding", label: "Feeding Schedule" },
          { href: "/admin/feeding/inventory", label: "Feed inventory" },
          { href: "/admin/feeding/logs", label: "Feeding logs" },
        //   { href: "/admin/inventory/feeds", label: "" },
        ],
      },
      // {
      //   label: "Water Quality",
      //   icon: Droplets,
      //   children: [
      //     { href: "/admin/inventory", label: "Water Test logs" },
      //     { href: "/admin/inventory/feeds", label: "Testing Schedule" },
      //   //   { href: "/admin/inventory/feeds", label: "Record species" },
      //   //   { href: "/admin/inventory/feeds", label: "" },
      //   ],
      // },
      {
        label: "Inventory & Supplies",
        icon: Boxes,
        children: [
          { href: "/admin/inventory", label: "Stock Overview" },
          { href: "/admin/inventory/equipment", label: "Equipment" },
          { href: "/admin/inventory/chemicals", label: "Chemicals/Treatments" },
          { href: "/admin/inventory/suppliers", label: "Suppliers" },
        ],
      },
      {
        label: "Sales & Finance",
        icon: CircleDollarSign,
        children: [
          { href: "/admin/finance", label: "Sales Records" },
          { href: "/admin/finance/invoices", label: "Invoices" },
          { href: "/admin/finance/expenses", label: "Expenses" },
          // { href: "/admin/finance/reports", label: "Financial Reports" },
        ],
      },
      {
        label: "Reports",
        icon: ChartColumnIncreasing,
        children: [
          { href: "/admin/reports", label: "Stock Reports" },
          { href: "/admin/reports/finance", label: "Financial Reports" },
          { href: "/admin/reports/growth", label: "Growth Report" },
          // { href: "/admin/inventory/feeds", label: "Export Data" },
        ],
      },
    ],
  },
  // {
  //   title: "Insights",
  //   items: [
  //     { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  //     { href: "/admin/reports", label: "Reports", icon: NotebookPen },
  //   ],
  // },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

const SideNav = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-border/40 border-gray-500 bg-white dark:bg-slate-950 md:flex">
      <div className="flex h-20 items-center border-b border-border/40 border-gray-500 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Fish className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold">Fintera</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-4 px-4 py-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-4">
            <div className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {section.title}
            </div>

            {section.items.map((item) => {
              const hasChildren = "children" in item;
              const isActive =
                ("href" in item && normalizePath(pathname) === normalizePath(item.href)) ||
                (hasChildren && item.children.some((child) => normalizePath(pathname) === normalizePath(child.href)));

              if (hasChildren) {
                const isOpen = openDropdown === item.label || (isActive && pathname !== "/admin");
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-700 dark:bg-blue-600 dark:text-white dark:ring-blue-700"
                          : "bg-white text-foreground/70 hover:bg-slate-100 hover:text-foreground dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
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
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block rounded-md px-3 py-2 text-sm transition-all ${
                                childActive
                                  ? "bg-slate-900 text-white font-medium dark:bg-blue-600 dark:text-white"
                                  : "bg-white text-foreground/60 hover:bg-slate-100 hover:text-foreground dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
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
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-700 dark:bg-blue-600 dark:text-white dark:ring-blue-700"
                      : "bg-white text-foreground/70 hover:bg-slate-100 hover:text-foreground dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
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