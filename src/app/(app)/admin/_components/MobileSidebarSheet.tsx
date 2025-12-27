"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { AppLogo } from "@/components/svgs/logo"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useRequests } from "@/lib/api/requests"

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

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const pathname = usePathname()

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex h-16 items-center gap-2 px-5 border-b">
          <Link
            href="/"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            <AppLogo />
          </Link>
        </div>

        <nav className="px-2 py-3">
          <ul className="space-y-1">
            {nav.map((item) => (
              <MobileSidebarItem
                key={item.href}
                item={item}
                pathname={pathname}
                badgeCount={
                  item.href === "/admin/requests" ? newRequestsCount : undefined
                }
                onNavigate={() => onOpenChange(false)}
              />
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

function MobileSidebarItem({
  item,
  pathname,
  badgeCount = 0,
  onNavigate,
}: {
  item: any
  pathname: string
  badgeCount?: number
  onNavigate: () => void
}) {
  const Icon = item.icon
  const isActiveParent =
    pathname === item.href || pathname.startsWith(`${item.href}/`)

  const [open, setOpen] = React.useState<boolean>(isActiveParent)

  React.useEffect(() => {
    if (isActiveParent) setOpen(true)
  }, [isActiveParent])

  const hasBadge = badgeCount > 0

  const baseLinkClasses =
    "flex h-[44px] items-center gap-2 rounded-[12px] px-4 py-3 font-hnd text-[14px]/[20px] tracking-normal transition"
  const activeClasses = "bg-[#017EA61A] text-primary font-bold"
  const inactiveClasses =
    "text-[#344054] hover:bg-[#017EA61A] hover:text-primary"

  if (!item.sublinks?.length) {
    return (
      <li>
        <Link
          href={item.href}
          onClick={onNavigate}
          className={cn(
            baseLinkClasses,
            isActiveParent ? activeClasses : inactiveClasses
          )}
        >
          <Icon className="h-5 w-5" />
          {item.label}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <div
        className={cn(
          baseLinkClasses,
          isActiveParent ? activeClasses : inactiveClasses
        )}
      >
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex items-center gap-2"
        >
          <Icon className="h-5 w-5" />
          {item.label}
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#F2F4F7]"
          aria-expanded={open}
        >
          {hasBadge ? (
            <Badge className="min-w-6 h-[17px] bg-[#CC0C16] text-white px-2 rounded-[10px] flex items-center justify-center border-0">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          ) : (
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform",
                open && "rotate-180"
              )}
            />
          )}
        </button>
      </div>

      {open && (
        <ul className="mt-1 space-y-1 pl-6">
          {item.sublinks.map((sub: any) => {
            const SubIcon = sub.icon
            const activeSub = pathname === sub.href
            return (
              <li key={sub.href}>
                <Link
                  href={sub.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex h-[38px] items-center gap-2 rounded-[10px] pl-2 py-2 text-[13px] transition",
                    activeSub
                      ? "bg-[#017EA61A] text-primary font-semibold"
                      : "text-[#475467] hover:bg-[#F2FBFE] hover:text-primary"
                  )}
                >
                  <SubIcon className="h-5 w-5" />
                  {sub.label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}
