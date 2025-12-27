"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

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
import { Badge } from "@/components/ui/badge"
import { useRequests } from "@/lib/api/requests"

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  sublinks?: Array<{
    href: string
    label: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  }>
}

const NAV: NavItem[] = [
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

/** Desktop sidebar wrapper (ONLY shows on lg+) */
export function Sidebar() {
  return (
    <aside className="hidden shrink-0 rounded-bl-[12px] rounded-tl-[12px] border-r border-[#E4E7EC] bg-white px-2 lg:block w-[212px]">
      <div className="flex h-full flex-col gap-6">
        <Link href="/" className="flex h-16 items-center gap-2 px-5">
          <AppLogo />
        </Link>

        <SidebarNav />
      </div>
    </aside>
  )
}

/**
 * Reusable nav list (use inside desktop AND inside mobile sheet)
 * onNavigate closes the sheet after clicking a link (mobile behavior)
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
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

  return (
    <nav className="flex flex-col gap-3">
      <ul className="space-y-1">
        {NAV.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            pathname={pathname}
            badgeCount={
              item.href === "/admin/requests" ? newRequestsCount : undefined
            }
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </nav>
  )
}

function SidebarItem({
  item,
  pathname,
  badgeCount = 0,
  onNavigate,
}: {
  item: NavItem
  pathname: string
  badgeCount?: number
  onNavigate?: () => void
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
          onClick={() => onNavigate?.()}
          className={[
            baseLinkClasses,
            isActiveParent ? activeClasses : inactiveClasses,
          ].join(" ")}
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
        className={[
          "w-full flex items-center",
          baseLinkClasses,
          isActiveParent ? activeClasses : inactiveClasses,
        ].join(" ")}
      >
        <Link
          href={item.href}
          onClick={() => onNavigate?.()}
          className="flex items-center gap-2"
        >
          <Icon className="h-5 w-5" />
          {item.label}
        </Link>

        <button
          type="button"
          aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto mr-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-[#667085] hover:bg-[#F2F4F7]"
        >
          {hasBadge ? (
            <Badge className="min-w-6 h-[17px] bg-[#CC0C16] text-white px-2 rounded-[10px] flex items-center justify-center border-0">
              {badgeCount > 99 ? "99+" : badgeCount}
            </Badge>
          ) : (
            <ChevronDown
              className={`h-5 w-5 text-inherit transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
      </div>

      {open && (
        <ul className="mt-1 space-y-1 pl-6">
          {item.sublinks.map((sub) => {
            const SubIcon = sub.icon
            const activeSub = pathname === sub.href

            return (
              <li key={sub.href}>
                <Link
                  href={sub.href}
                  onClick={() => onNavigate?.()}
                  className={[
                    "flex h-[38px] items-center gap-2 rounded-[10px] pl-2 py-2 text-[13px] transition",
                    activeSub
                      ? "bg-[#017EA61A] text-primary font-semibold"
                      : "text-[#475467] hover:bg-[#F2FBFE] hover:text-primary",
                  ].join(" ")}
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
