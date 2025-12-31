"use client"

import { cn } from "@/lib/utils"
import * as React from "react"

export type LocationSummary = {
  total_number_of_providers: number
  total_claims_amount: number
  approved_claims_amount: number
  rejected_claims_amount: number
}

function toNumber(x: unknown) {
  if (typeof x === "number") return x
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
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

export function LocationStatsRow({
  summary,
}: {
  summary?: Partial<LocationSummary>
}) {
  const s = React.useMemo(() => {
    const totalProviders = toNumber(summary?.total_number_of_providers)
    const totalClaims = toNumber(summary?.total_claims_amount)
    const approved = toNumber(summary?.approved_claims_amount)
    const rejected = toNumber(summary?.rejected_claims_amount)
    const pending = Math.max(0, totalClaims - approved - rejected)

    return { totalProviders, totalClaims, approved, rejected, pending }
  }, [summary])

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
        <Stat label="Total Providers" value={String(s.totalProviders)} />
        <Stat label="Total claims" value={fmtNaira(s.totalClaims)} />
        <Stat label="Approved claims" value={fmtNaira(s.approved)} />
        <Stat
          label="Rejected claims"
          value={fmtNaira(s.rejected)}
          valueClassName="text-[#B42318]"
        />
        <Stat label="Pending Claims" value={fmtNaira(s.pending)} />
      </div>
    </div>
  )
}
