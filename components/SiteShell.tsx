"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdminRoute && <Header />}
      <main className="grow">{children}</main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}
