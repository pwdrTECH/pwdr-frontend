"use client"

import { cn } from "@/lib/utils"
import * as React from "react"
import type { DiagnosisRow } from "./UtilizationDiagnosisTable"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-3">
      <div className="text-[12px]/[18px] text-[#667085]">{label}</div>
      <div
        className={cn(
          "text-[18px]/[24px] font-semibold text-[#101828]",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function UtilizationDiagnosisStatsRow({
  rows,
}: {
  rows: DiagnosisRow[]
}) {
  const stats = React.useMemo(() => {
    const uniqueDx = new Set(rows.map((r) => r.diagnosis)).size
    const totalCost = rows.reduce((a, r) => a + Number(r.cost ?? 0), 0)
    const enrolleeCount = rows.reduce(
      (a, r) => a + Number(r.enrolleeCount ?? 0),
      0
    )
    const visits = rows.reduce((a, r) => a + Number(r.timesDiagnosed ?? 0), 0)

    return { uniqueDx, totalCost, enrolleeCount, visits }
  }, [rows])

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-4">
      <div className="grid grid-cols-4 gap-6">
        <Stat
          label="No. of Diagnosis"
          value={stats.uniqueDx.toLocaleString("en-NG")}
        />
        <Stat label="Total Cost" value={fmtNaira(stats.totalCost)} />
        <Stat
          label="Enrollee count"
          value={stats.enrolleeCount.toLocaleString("en-NG")}
        />
        <Stat
          label="No. of Visits"
          value={stats.visits.toLocaleString("en-NG")}
        />
      </div>
    </div>
  )
}
