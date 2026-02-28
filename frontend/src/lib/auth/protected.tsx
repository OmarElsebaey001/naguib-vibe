"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context";

/**
 * Wrap a page to require authentication.
 * Redirects to /login if not authenticated.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-500">
        <p className="text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
