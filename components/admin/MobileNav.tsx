"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Fish,
  Menu,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  NotebookPen,
  Settings,
  Waves,
  Package,
  UtensilsCrossed,
  Boxes,
  CircleDollarSign,
  ChartColumnIncreasing,
  Droplets,
} from "lucide-react";

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

const navSections = [
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
          { href: "/admin/inventory/feeds", label: "Pond Details" },
        ],
      },
      {
        label: "Stock Management",
        icon: Package,
        children: [
          { href: "/admin/inventory", label: "Stocking Records" },
          { href: "/admin/inventory/feeds", label: "Species Management" },
          { href: "/admin/inventory/feeds", label: "Stocking History" },
          { href: "/admin/inventory/feeds", label: "Mortality Records" },
          { href: "/admin/inventory/feeds", label: "Harvest Records" },
        ],
      },
      {
        label: "Feeding",
        icon: UtensilsCrossed,
        children: [
          { href: "/admin/inventory", label: "Feeding Schedule" },
          { href: "/admin/inventory/feeds", label: "Feed inventory" },
          { href: "/admin/inventory/feeds", label: "Feeding logs" },
        ],
      },
      {
        label: "Water Quality",
        icon: Droplets,
        children: [
          { href: "/admin/inventory", label: "Water Test logs" },
          { href: "/admin/inventory/feeds", label: "Testing Schedule" },
        ],
      },
      {
        label: "Inventory & Supplies",
        icon: Boxes,
        children: [
          { href: "/admin/inventory", label: "Stock Overview" },
          { href: "/admin/inventory/feeds", label: "Equipment" },
          { href: "/admin/inventory/feeds", label: "Chemicals/Treatments" },
          { href: "/admin/inventory/feeds", label: "Suppliers" },
        ],
      },
      {
        label: "Sales & Finance",
        icon: CircleDollarSign,
        children: [
          { href: "/admin/inventory", label: "Sales Records" },
          { href: "/admin/inventory/feeds", label: "Invoices" },
          { href: "/admin/inventory/feeds", label: "Expenses" },
          { href: "/admin/inventory/feeds", label: "Financial Reports" },
        ],
      },
      {
        label: "Reports & Analytics",
        icon: ChartColumnIncreasing,
        children: [
          { href: "/admin/inventory", label: "Production Reports" },
          { href: "/admin/inventory/feeds", label: "Financial Reports" },
          { href: "/admin/inventory/feeds", label: "Growth Analytics" },
          { href: "/admin/inventory/feeds", label: "Export Data" },
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

const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";

const MobileNav = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <button
          aria-label="Open navigation menu"
          className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border/40 px-6 py-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <Fish className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Fintera</span>
          </Link>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <nav className="space-y-4 px-4 py-6">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <div className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
                {section.title}
              </div>

              {section.items.map((item) => {
                const hasChildren = "children" in item;
                const isActive =
                  ("href" in item && normalizePath(pathname) === normalizePath(item.href)) ||
                  (hasChildren && item.children.some((child) => normalizePath(pathname) === normalizePath(child.href)));

                if (hasChildren) {
                  const isDropdownOpen = openDropdown === item.label || (isActive && pathname !== "/admin");
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
                        {isDropdownOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>

                      {isDropdownOpen && (
                        <div className="ml-5 space-y-1 border-l border-border/40 pl-3">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setIsOpen(false)}
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
                    onClick={() => setIsOpen(false)}
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
