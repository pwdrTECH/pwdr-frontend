"use client"

import { cn } from "@/lib/utils"
import * as React from "react"
import type { UtilServiceRow } from "./mock"

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

export function ServiceStatsRow({ rows }: { rows: UtilServiceRow[] }) {
  const { noOfServices, totalCost, avgCost, mostUsed } = React.useMemo(() => {
    const totalCost = rows.reduce((a, b) => a + (b.cost ?? 0), 0)
    const services = rows.map((r) => r.service)
    const uniqueServices = new Set(services)
    const counts = services.reduce<Record<string, number>>((acc, s) => {
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    }, {})
    const mostUsed =
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
    const avgCost = rows.length ? Math.round(totalCost / rows.length) : 0

    return {
      noOfServices: uniqueServices.size,
      totalCost,
      avgCost,
      mostUsed,
    }
  }, [rows])

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-6">
      <div className="grid grid-cols-4 gap-8">
        <Stat label="No. of Services" value={String(noOfServices)} />
        <Stat label="Total Cost" value={fmtNaira(totalCost)} />
        <Stat label="Average Service Cost" value={fmtNaira(avgCost)} />
        <Stat label="Most Used Service" value={mostUsed} />
      </div>
    </div>
  )
}
