import type { ReactNode } from "react"
import { TopBar } from "./_components/TopBar"
import { Sidebar } from "./_components/Sidebar"

export default function UserAppLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-white text-[#0F1222]">
      <div className="flex min-h-dvh w-full">
        {/* Sidebar for desktop */}
        <Sidebar />

        {/* Main column */}
        <div className="flex min-w-0 grow flex-col">
          <TopBar />
          {/* Page content container */}
          <div className="pb-10 pt-3 px-3 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </main>
  )
}
