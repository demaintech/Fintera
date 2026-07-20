import React from "react";
import SideNav from "../../components/admin/SideNav";
import DashboardHeader from "../../components/admin/DashboardHeader";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen w-full bg-muted/40">
        <SideNav />
        <div className="flex flex-col flex-1 md:ml-72">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}