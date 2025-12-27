"use client"

import * as React from "react"

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}
function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-5">
      <div className="text-[12px] text-[#667085]">{label}</div>
      <div className="text-[16px] font-semibold text-[#101828]">{value}</div>
    </div>
  )
}

export function SchemeStatsRow({ rows }: { rows: any[] }) {
  const totalScheme = React.useMemo(() => 263, []) // screenshot value
  const totalCost = React.useMemo(
    () => rows.reduce((a: number, b: any) => a + (b.totalCost ?? 0), 0),
    [rows]
  )
  const avgCost = React.useMemo(() => {
    const denom = Math.max(1, rows.length)
    return Math.round(totalCost / denom)
  }, [totalCost, rows.length])

  return (
    <div className="w-full border-b border-[#EEF0F5]">
      <div className="grid grid-cols-5 px-6">
        <Stat label="Total Scheme" value={fmtInt(totalScheme)} />
        <Stat label="Total Cost" value={fmtNaira(totalCost)} />
        <Stat label="Avg Cost/Enrollee" value={fmtNaira(avgCost)} />
        <Stat label="Top Scheme" value="NHIS" />
        <Stat label="Avg. Approval Rate" value="50%" />
      </div>
    </div>
  )
}
