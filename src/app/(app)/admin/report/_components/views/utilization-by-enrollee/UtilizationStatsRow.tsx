"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Row = {
  premium: number
  utilization: number
  usedPct: number
  balance: number
}

function naira(n: number) {
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
      <div className="text-[14px] leading-5] font-normal text-[#475367]">
        {label}
      </div>
      <div
        className={cn(
          "text-[15px] leading-6 font-bold text-[#101928] text-center",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function UtilizationStatsRow({ rows }: { rows: Row[] }) {
  const totals = React.useMemo(() => {
    const premium = rows.reduce((a, r) => a + (r.premium ?? 0), 0)
    const utilization = rows.reduce((a, r) => a + (r.utilization ?? 0), 0)
    const balance = rows.reduce((a, r) => a + (r.balance ?? 0), 0)
    const usedPct = rows.length
      ? Math.round(rows.reduce((a, r) => a + (r.usedPct ?? 0), 0) / rows.length)
      : 0

    return { premium, utilization, usedPct, balance }
  }, [rows])

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-8">
        <Stat label="Total Premium" value={naira(totals.premium)} />
        <Stat label="Total Utilization" value={naira(totals.utilization)} />
        <Stat
          label="Utilization Used"
          value={`${totals.usedPct}%`}
          valueClassName="text-[#0B8A35]"
        />
        <Stat
          label="Balance"
          value={naira(totals.balance)}
          valueClassName="text-[#0B8A35]"
        />
      </div>
    </div>
  )
}
