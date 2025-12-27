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
    <div className="flex flex-col items-center justify-center gap-3 py-7">
      <div className="text-[12px] text-[#667085]">{label}</div>
      <div className="text-[20px] font-semibold text-[#101828]">{value}</div>
    </div>
  )
}

export function OverdueStatsRow({ rows }: { rows: any[] }) {
  const totalOverdue = rows.length

  const uniqueEnrollees = React.useMemo(() => {
    const set = rows.reduce((acc, r) => {
      acc.add(String(r?.enrolleeName ?? ""))
      return acc
    }, new Set<string>())
    set.delete("")
    return set.size
  }, [rows])

  const totalCost = React.useMemo(
    () => rows.reduce((a: number, b: any) => a + (b?.totalCost ?? 0), 0),
    [rows]
  )

  return (
    <div className="w-full border-b border-[#EEF0F5]">
      <div className="grid grid-cols-3 px-6">
        <Stat label="Total Overdue Claims" value={fmtInt(totalOverdue)} />
        <Stat label="Enrollees Involved" value={fmtInt(uniqueEnrollees)} />
        <Stat label="Total Cost" value={fmtNaira(totalCost)} />
      </div>
    </div>
  )
}
