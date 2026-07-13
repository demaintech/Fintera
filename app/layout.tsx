import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Fintera",
  description: "Fish and pond management system for aquaculture farmers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-background text-foreground">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}