"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { OrgRow } from "./mock"

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}
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
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="text-[12px] leading-[18px] text-[#667085]">{label}</div>
      <div
        className={cn(
          "text-[16px] leading-[24px] font-semibold text-[#101828]",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function OrganizationStatsRow({ rows }: { rows: OrgRow[] }) {
  const summary = React.useMemo(() => {
    const totalOrganizations = new Set(rows.map((r) => r.organization)).size
    const totalCost = rows.reduce((a, r) => a + (r.totalCost ?? 0), 0)
    const totalRequests = rows.reduce((a, r) => a + (r.requests ?? 0), 0)

    // average approval rate not present in mock; use stable placeholder like screenshot
    const avgApprovalRate = 50

    return { totalOrganizations, totalCost, totalRequests, avgApprovalRate }
  }, [rows])

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-5">
      <div className="grid grid-cols-4 gap-6">
        <Stat
          label="Total Organizations"
          value={fmtInt(summary.totalOrganizations)}
        />
        <Stat label="Total Cost" value={fmtNaira(summary.totalCost)} />
        <Stat label="Total Requests" value={fmtInt(summary.totalRequests)} />
        <Stat
          label="Avg. Approval Rate"
          value={`${summary.avgApprovalRate}%`}
        />
      </div>
    </div>
  )
}
