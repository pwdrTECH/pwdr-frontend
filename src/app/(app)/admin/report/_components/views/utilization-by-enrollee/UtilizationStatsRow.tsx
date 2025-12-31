"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Row = {
  premium: number
  utilization: number
  usedPct: number
  balance: number
}

type Summary = Partial<{
  total_premium: number
  total_utilization: number
  utilization_used_pct: number
  total_balance: number
}>

function naira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function toNumber(x: any) {
  if (typeof x === "number") return x
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
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
      <div className="text-[14px] leading-5 font-normal text-[#475367]">
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

export function UtilizationStatsRow({
  rows,
  summary,
  loading,
}: {
  rows: Row[]
  summary?: Summary
  loading?: boolean
}) {
  const totalsFromRows = React.useMemo(() => {
    const premium = rows.reduce((a, r) => a + toNumber(r.premium), 0)
    const utilization = rows.reduce((a, r) => a + toNumber(r.utilization), 0)
    const balance = rows.reduce((a, r) => a + toNumber(r.balance), 0)
    const usedPct = rows.length
      ? Math.round(
          rows.reduce((a, r) => a + toNumber(r.usedPct), 0) / rows.length
        )
      : 0

    return { premium, utilization, usedPct, balance }
  }, [rows])

  const totals = React.useMemo(() => {
    // Prefer summary when available, fallback to computed rows
    const premium =
      summary?.total_premium != null
        ? toNumber(summary.total_premium)
        : totalsFromRows.premium

    const utilization =
      summary?.total_utilization != null
        ? toNumber(summary.total_utilization)
        : totalsFromRows.utilization

    const usedPct =
      summary?.utilization_used_pct != null
        ? toNumber(summary.utilization_used_pct)
        : totalsFromRows.usedPct

    const balance =
      summary?.total_balance != null
        ? toNumber(summary.total_balance)
        : totalsFromRows.balance

    return { premium, utilization, usedPct, balance }
  }, [summary, totalsFromRows])

  return (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-8">
        <Stat
          label="Total Premium"
          value={loading ? "…" : naira(totals.premium)}
        />
        <Stat
          label="Total Utilization"
          value={loading ? "…" : naira(totals.utilization)}
        />
        <Stat
          label="Utilization Used"
          value={loading ? "…" : `${totals.usedPct}%`}
          valueClassName="text-[#0B8A35]"
        />
        <Stat
          label="Balance"
          value={loading ? "…" : naira(totals.balance)}
          valueClassName="text-[#0B8A35]"
        />
      </div>
    </div>
  )
}
