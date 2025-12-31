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
    <div className="flex flex-col items-center justify-center gap-2 py-5">
      <div className="text-[12px] text-[#667085]">{label}</div>
      <div className="text-[16px] font-semibold text-[#101828]">{value}</div>
    </div>
  )
}

export type SchemeSummary = {
  total_number_of_schemes?: number | string
  total_cost?: number | string
  average_cost_per_enrolee?: number | string
  top_scheme?: string
  average_approval_rate?: number | string
}

export function SchemeStatsRow({
  rows,
  summary,
}: {
  rows: Array<{
    totalCost?: number
    totalRequests?: number
    avgCostPerEnrollee?: number
  }>
  summary?: SchemeSummary
}) {
  // Prefer API summary; gracefully fall back to derived values from rows (useful during loading / older API)
  const derived = React.useMemo(() => {
    const totalCost = rows.reduce((a, r) => a + (r.totalCost ?? 0), 0)
    const avgCost =
      rows.length > 0
        ? Math.round(
            rows.reduce((a, r) => a + (r.avgCostPerEnrollee ?? 0), 0) /
              rows.length
          )
        : 0
    return { totalCost, avgCost }
  }, [rows])

  const totalSchemes = toNumber(summary?.total_number_of_schemes)
  const totalCost =
    summary?.total_cost == null
      ? derived.totalCost
      : toNumber(summary.total_cost)
  const avgCost =
    summary?.average_cost_per_enrolee == null
      ? derived.avgCost
      : toNumber(summary.average_cost_per_enrolee)

  const topScheme = summary?.top_scheme?.trim() ? summary.top_scheme : "—"
  const avgApprovalRate =
    summary?.average_approval_rate == null
      ? null
      : toNumber(summary.average_approval_rate)

  return (
    <div className="w-full border-b border-[#EEF0F5]">
      <div className="grid grid-cols-5 px-6">
        <Stat label="Total Scheme" value={fmtInt(totalSchemes)} />
        <Stat label="Total Cost" value={fmtNaira(totalCost)} />
        <Stat label="Avg Cost/Enrollee" value={fmtNaira(avgCost)} />
        <Stat label="Top Scheme" value={topScheme} />
        <Stat
          label="Avg. Approval Rate"
          value={avgApprovalRate == null ? "—" : `${avgApprovalRate}%`}
        />
      </div>
    </div>
  )
}
