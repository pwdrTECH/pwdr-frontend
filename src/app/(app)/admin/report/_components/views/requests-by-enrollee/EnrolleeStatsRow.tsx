"use client"

import { cn } from "@/lib/utils"
import type { EnroleeRequestsSummary } from "@/lib/api/reports"

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
    <div className="flex flex-col gap-2">
      <div className="text-[12px]/[18px] text-[#667085]">{label}</div>
      <div
        className={cn(
          "text-[20px]/[28px] font-semibold text-[#101828]",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function EnrolleeStatsRow({
  summary,
}: {
  summary?: EnroleeRequestsSummary | null
}) {
  const s = summary ?? {
    total_requests_count: 0,
    total_claims_amount: 0,
    total_denied_count: 0,
    total_approved_claims_amount: 0,
    rejected_claims_amount: 0,
    pending_claims_amount: 0,
  }

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-8">
      <div className="grid grid-cols-5 gap-8">
        <Stat label="Total Requests" value={String(s.total_requests_count)} />
        <Stat label="Total claims" value={fmtNaira(s.total_claims_amount)} />
        <Stat
          label="Approved claims"
          value={fmtNaira(s.total_approved_claims_amount)}
        />
        <Stat
          label="Rejected claims"
          value={fmtNaira(s.rejected_claims_amount)}
          valueClassName="text-[#F04438]"
        />
        <Stat
          label="Pending Claims"
          value={fmtNaira(s.pending_claims_amount)}
        />
      </div>
    </div>
  )
}
