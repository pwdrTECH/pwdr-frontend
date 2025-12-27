import AuthGuard from "@/components/auth/AuthGuard"
import type { ReactNode } from "react"
import { Sidebar } from "./_components/Sidebar"
import { TopBar } from "./_components/TopBar"

export default function UserAppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <main className="min-h-dvh bg-white text-[#0F1222]">
        <div className="flex min-h-dvh w-full">
          <Sidebar />

          <div className="flex min-w-0 grow flex-col">
            <TopBar />
            <div className="pb-10 pt-3 px-3 sm:px-6 lg:px-8">{children}</div>
          </div>
        </div>
      </main>
    </AuthGuard>
  )
}
