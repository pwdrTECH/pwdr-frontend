"use client"

import { CircledProfileIcon, NotificationIcon } from "@/components/svgs"
import { AppLogo } from "@/components/svgs/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useSelectedLayoutSegments } from "next/navigation"
import * as React from "react"
import { SidebarNav } from "./Sidebar"

const LABELS: Record<string, string> = {
  "": "Dashboard",
  dashboard: "Dashboard",
  requests: "EMR Requests",
  "requests/pre-auth": "Pre-Auth Requests",
  "requests/status": "Request Status",
  "requests/channeled": "Channeled Requests",
  "pa-code": "PA Code",
  claims: "Claims",
  billing: "Billing",
  hmos: "Providers",
  patients: "Patients",
  settings: "Settings",
}

// ---- helpers ----
const ID_LIKE = /^[0-9a-f-]{8,}$|^\d+$/i

function humanizeSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function normalizeSeg(seg: string) {
  return ID_LIKE.test(seg) ? "[id]" : seg.toLowerCase()
}

function shortId(val: string) {
  return val.length > 10 ? `${val.slice(0, 4)}…${val.slice(-4)}` : val
}

// Title shows ONLY the subpage label (no parents)
function leafTitleFromSegments(segments: string[]) {
  const segs = segments.length ? segments : ["dashboard"]
  const normalized = segs.map(normalizeSeg)
  const fullKey = normalized.join("/")

  if (LABELS[fullKey]) return LABELS[fullKey]

  const leafNorm = normalized[normalized.length - 1]
  if (LABELS[leafNorm]) return LABELS[leafNorm]

  const rawLeaf = segs[segs.length - 1]
  return ID_LIKE.test(rawLeaf) ? `#${shortId(rawLeaf)}` : humanizeSlug(rawLeaf)
}

export function TopBar() {
  const segs = useSelectedLayoutSegments()
  const title = leafTitleFromSegments(segs)

  return (
    <header className="sticky top-0 z-30 border-b border-[#EEF0F5] bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Mobile: menu + logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <MobileSidebar />
          <Link href="/">
            <AppLogo />
          </Link>
        </div>

        {/* Desktop title */}
        <h1 className="hidden text-[24px]/[20px] font-hnd font-normal text-[#344054] tracking-normal align-middle lg:block">
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="rounded-full p-1.5 text-[#717792] hover:bg-[#F2F5FA]"
          >
            <NotificationIcon />
          </button>

          <button
            type="button"
            aria-label="Account"
            className="rounded-full p-1.5 text-[#717792] hover:bg-[#F2F5FA]"
          >
            <CircledProfileIcon />
          </button>
        </div>
      </div>
    </header>
  )
}

function MobileSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-md">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[88vw] max-w-[320px] p-0">
        <SheetHeader className="px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Link href="/" onClick={() => setOpen(false)}>
              <AppLogo />
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="border-t border-[#E4E7EC]" />

        {/* IMPORTANT: render SidebarNav (not Sidebar) inside the Sheet */}
        <div className="px-2 py-3">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
