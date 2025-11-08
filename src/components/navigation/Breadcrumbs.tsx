"use client"

import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon } from "../svgs"

export default function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname()

  // Example: /provider/hospital-xyz/tariff-plans → ["provider", "hospital-xyz", "tariff-plans"]
  const segments = pathname.split("/").filter((seg) => seg.length > 0)

  // Utility: format slug-like segments to readable words
  const formatSegment = (seg: string) =>
    seg.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  // Build partial paths for each breadcrumb level
  const paths = segments.map(
    (_, idx) => "/" + segments.slice(0, idx + 1).join("/")
  )

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-2 text-sm text-[#4B5563]",
        className
      )}
    >
      {/* Home */}
      <Link
        href="/"
        className="flex items-center text-[#4B5563] hover:text-[#5F6368] text-[14px]/[20px] tracking-normal font-medium font-hnd"
      >
        <HomeIcon />
      </Link>

      {segments.length > 0 && (
        <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
      )}

      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1
        return (
          <div key={seg} className="flex items-center gap-2">
            {isLast ? (
              <span className="text-[#5F6368] text-[14px]/[20px] tracking-normal font-medium font-hnd">
                {formatSegment(seg)}
              </span>
            ) : (
              <Link
                href={paths[idx]}
                className="text-[#4B5563] hover:text-[#5F6368]/90 text-[14px]/[20px] tracking-normal font-medium font-hnd transition-colors cursor-pointer"
              >
                {formatSegment(seg)}
              </Link>
            )}
            {!isLast && <ChevronRight className="h-4 w-4 text-[#B4B4B4]" />}
          </div>
        )
      })}
    </nav>
  )
}
