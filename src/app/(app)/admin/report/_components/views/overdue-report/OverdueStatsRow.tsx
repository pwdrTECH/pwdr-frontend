"use client"

import * as React from "react"

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}
function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function toNumber(x: unknown) {
  if (typeof x === "number") return Number.isFinite(x) ? x : 0
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-7">
      <div className="text-[12px] text-[#667085]">{label}</div>
      <div className="text-[20px] font-semibold text-[#101828]">{value}</div>
    </div>
  )
}

export type OverdueSummary = {
  total_overdue_claims?: number | string
  enrollees_involved?: number | string
  total_cost?: number | string
  [key: string]: any
}

type RowLike = {
  enrolleeName?: string
  totalCost?: number
}

export function OverdueStatsRow({
  rows,
  summary,
}: {
  rows: RowLike[]
  summary?: OverdueSummary
}) {
  // fallback values (when summary is missing during loading / old endpoint)
  const derived = React.useMemo(() => {
    const totalOverdueClaims = rows.length

    const uniqueEnrollees = rows.reduce((acc, r) => {
      const name = String(r?.enrolleeName ?? "").trim()
      if (name) acc.add(name)
      return acc
    }, new Set<string>()).size

    const totalCost = rows.reduce((a, r) => a + (r?.totalCost ?? 0), 0)

    return { totalOverdueClaims, uniqueEnrollees, totalCost }
  }, [rows])

  const totalOverdueClaims =
    summary?.total_overdue_claims == null
      ? derived.totalOverdueClaims
      : toNumber(summary.total_overdue_claims)

  const enrolleesInvolved =
    summary?.enrollees_involved == null
      ? derived.uniqueEnrollees
      : toNumber(summary.enrollees_involved)

  const totalCost =
    summary?.total_cost == null
      ? derived.totalCost
      : toNumber(summary.total_cost)

  return (
    <div className="w-full border-b border-[#EEF0F5]">
      <div className="grid grid-cols-3 px-6">
        <Stat label="Total Overdue Claims" value={fmtInt(totalOverdueClaims)} />
        <Stat label="Enrollees Involved" value={fmtInt(enrolleesInvolved)} />
        <Stat label="Total Cost" value={fmtNaira(totalCost)} />
      </div>
    </div>
  )
}
