"use client";

import { useAuth } from "@/lib/auth/hooks";
import { rememberReturnTo } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

type Role = "admin" | "user" | string;

export default function AuthGuard({
  allowedRoles,
  fallback = null,
  children,
}: {
  allowedRoles?: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  const allowed = useMemo(
    () => (allowedRoles ?? []).map((r) => r.toLowerCase()),
    [allowedRoles],
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Store current location for redirect after login
      rememberReturnTo(window.location.pathname + window.location.search);
      router.replace("/login");
      return;
    }

    if (
      allowed.length > 0 &&
      (!user?.user_type || !allowed.includes(user?.user_type))
    ) {
      // Redirect based on role
      const roleHomes: Record<string, string> = {
        admin: "/admin",
        user: "/user",
      };
      const redirectTo = roleHomes[user?.user_type || ""] || "/";
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, allowed, user?.user_type, router]);

  if (isLoading) {
    return (
      fallback ?? (
        <div className="flex justify-center items-center min-h-screen"></div>
      )
    );
  }

  if (!isAuthenticated) return null;
  if (
    allowed.length > 0 &&
    (!user?.user_type || !allowed.includes(user?.user_type))
  )
    return null;

  return <>{children}</>;
}
