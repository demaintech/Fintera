import React from "react";
import SideNav from "../../components/admin/SideNav";
import DashboardHeader from "../../components/admin/DashboardHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <SideNav />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}