import AuthGuard from "@/components/auth/AuthGuard";
import type { ReactNode } from "react";

export default function UserAppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["user"]}>
      <main className="min-h-dvh bg-white text-[#0F1222]">
        <div className="flex min-h-dvh w-full">
          {/* Page content container */}
          <div className="pb-10 pt-3 px-3 sm:px-6 lg:px-8">{children}</div>
        </div>
      </main>
    </AuthGuard>
  );
}
