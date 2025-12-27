"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  BillingIcon,
  ChanneledRequestsIcon,
  ClaimIcon,
  DashboardIcon,
  HospitalIcon,
  MessageTextIcon,
  PeopleIcon,
  ReportsIcon,
  RequestStatus,
  SettingsIcon,
} from "@/components/svgs"
import { AppLogo } from "@/components/svgs/logo"
import { cn } from "@/lib/utils"
import { useRequests } from "@/lib/api/requests"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  sublinks?: Array<{
    href: string
    label: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  }>
}

export function MiniSheetSidebar() {
  const pathname = usePathname()

  // unread count badge (same logic you already use)
  const { data: requestsData } = useRequests({
    status: "unread",
    page: 1,
    limit: 1,
  })

  const newRequestsCount =
    requestsData?.pagination?.total && requestsData.pagination.total > 0
      ? requestsData.pagination.total
      : 0

  const nav: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
    {
      href: "/admin/requests",
      label: "Requests",
      icon: MessageTextIcon,
      sublinks: [
        {
          href: "/admin/requests/status",
          label: "Request status",
          icon: RequestStatus,
        },
        {
          href: "/admin/requests/channeled",
          label: "Channels Requests",
          icon: ChanneledRequestsIcon,
        },
      ],
    },
    { href: "/admin/claims", label: "Claims", icon: ClaimIcon },
    { href: "/admin/report", label: "Report", icon: ReportsIcon },
    { href: "/admin/beneficiaries", label: "Beneficiaries", icon: PeopleIcon },
    { href: "/admin/providers", label: "Providers", icon: HospitalIcon },
    { href: "/admin/schemes", label: "Schemes", icon: MessageTextIcon },
    { href: "/admin/call-agent", label: "Call Agent", icon: MessageTextIcon },
    { href: "/admin/billings", label: "Billings", icon: BillingIcon },
    { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
  ]

  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [activeItem, setActiveItem] = React.useState<NavItem | null>(null)

  function openMiniSheet(item: NavItem) {
    setActiveItem(item)
    setSheetOpen(true)
  }

  return (
    <>
      {/* mini rail (shows on <lg) */}
      <aside className="lg:hidden w-[64px] shrink-0 border-r border-[#E4E7EC] bg-white">
        <div className="flex h-full flex-col items-center py-4 gap-4">
          <Link
            href="/admin/dashboard"
            className="h-10 w-10 grid place-items-center"
          >
            <AppLogo />
          </Link>

          <div className="h-px w-10 bg-[#EAECF0]" />

          <nav className="flex flex-col items-center gap-3 w-full px-2">
            {nav.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)

              const isRequests = item.href === "/admin/requests"
              const showBadge = isRequests && newRequestsCount > 0

              return (
                <div key={item.href} className="relative">
                  {item.sublinks?.length ? (
                    <button
                      type="button"
                      onClick={() => openMiniSheet(item)}
                      className={cn(
                        "h-11 w-11 rounded-[12px] grid place-items-center transition",
                        isActive
                          ? "bg-[#017EA61A] text-primary"
                          : "text-[#344054] hover:bg-[#017EA61A] hover:text-primary"
                      )}
                      aria-label={item.label}
                      title={item.label}
                    >
                      <Icon className="h-6 w-6" />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "h-11 w-11 rounded-[12px] grid place-items-center transition",
                        isActive
                          ? "bg-[#017EA61A] text-primary"
                          : "text-[#344054] hover:bg-[#017EA61A] hover:text-primary"
                      )}
                      aria-label={item.label}
                      title={item.label}
                    >
                      <Icon className="h-6 w-6" />
                    </Link>
                  )}

                  {showBadge && (
                    <span className="absolute -top-1 -right-1">
                      <Badge className="h-[18px] min-w-[18px] px-1.5 rounded-full bg-[#CC0C16] text-white text-[11px] border-0 grid place-items-center">
                        {newRequestsCount > 99 ? "99+" : newRequestsCount}
                      </Badge>
                    </span>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* mini sheet for submenus */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-[320px] p-0">
          <SheetHeader className="px-5 py-4 border-b border-[#EAECF0]">
            <SheetTitle className="text-[16px] font-semibold text-[#101828]">
              {activeItem?.label ?? "Menu"}
            </SheetTitle>
          </SheetHeader>

          <div className="p-4 flex flex-col gap-2">
            {/* parent quick action */}
            {activeItem && (
              <Link
                href={activeItem.href}
                onClick={() => setSheetOpen(false)}
                className="flex items-center justify-between rounded-[12px] border border-[#EAECF0] px-3 py-3 text-sm text-[#344054] hover:bg-[#F9FAFB]"
              >
                <span className="flex items-center gap-2">
                  <activeItem.icon className="h-5 w-5" />
                  {activeItem.label}
                </span>
                <span className="text-[#98A2B3]">Open</span>
              </Link>
            )}

            {/* sublinks */}
            <div className="mt-2 space-y-1">
              {activeItem?.sublinks?.map((sub) => {
                const SubIcon = sub.icon
                const activeSub = pathname === sub.href

                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-[12px] px-3 py-3 text-sm transition",
                      activeSub
                        ? "bg-[#017EA61A] text-primary font-semibold"
                        : "text-[#475467] hover:bg-[#F2FBFE] hover:text-primary"
                    )}
                  >
                    <SubIcon className="h-5 w-5" />
                    {sub.label}
                  </Link>
                )
              })}
            </div>

            <div className="pt-3">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-[12px]"
                onClick={() => setSheetOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
