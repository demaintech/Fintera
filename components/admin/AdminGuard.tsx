"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isMounted, isLoading, isAuthenticated, router]);

  // Show a stateful loading state while figuring out the session
  if (!isMounted || isLoading || !isAuthenticated) {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl border border-white/10 bg-linear-to-b from-white/5 to-white/0 shadow-2xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="rounded-full p-3 bg-primary/10 border border-primary/20"
            >
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </motion.div>
            <div className="text-center">
              <h3 className="font-semibold text-lg text-foreground">Verifying Session</h3>
              <p className="text-sm text-muted-foreground mt-1">Please wait while we secure your connection...</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return <>{children}</>;
}
