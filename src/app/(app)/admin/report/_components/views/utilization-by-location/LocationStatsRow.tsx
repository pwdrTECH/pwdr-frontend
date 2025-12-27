"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { UtilizationLocationRow } from "./mock"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[12px]/[18px] text-[#667085]">{label}</div>
      <div
        className={cn(
          "text-[14px]/[20px] font-semibold text-[#101828]",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function LocationStatsRow({ rows }: { rows: UtilizationLocationRow[] }) {
  const stats = React.useMemo(() => {
    const totalProviders = new Set(rows.map((r) => r.provider)).size
    const totalClaims = rows.reduce((a, b) => a + (b.approvedClaim ?? 0), 0)

    // mock split (matches screenshot style)
    const approved = totalClaims
    const rejected = Math.round(totalClaims * 0.1456)
    const pending = Math.round(totalClaims * 0.2266)

    return { totalProviders, totalClaims, approved, rejected, pending }
  }, [rows])

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-6">
      <div className="grid grid-cols-5 gap-8">
        <Stat label="Total Providers" value={String(stats.totalProviders)} />
        <Stat label="Total claims" value={fmtNaira(stats.totalClaims)} />
        <Stat label="Approved claims" value={fmtNaira(stats.approved)} />
        <Stat
          label="Rejected claims"
          value={fmtNaira(stats.rejected)}
          valueClassName="text-[#B42318]"
        />
        <Stat label="Pending Claims" value={fmtNaira(stats.pending)} />
      </div>
    </div>
  )
}
