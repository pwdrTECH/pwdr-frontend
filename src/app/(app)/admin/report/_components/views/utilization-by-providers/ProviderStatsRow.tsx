"use client"

import * as React from "react"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}
function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-5">
      <div className="text-[12px] text-[#667085]">{label}</div>
      <div className="text-[16px] font-semibold text-[#101828]">{value}</div>
    </div>
  )
}

export type ProviderSummary = {
  total_number_of_providers: number
  total_cost: number
  total_requests: number
  average_approval_rate: number
}

export function ProviderStatsRow({
  rows,
  summary,
}: {
  rows: any[]
  summary?: Partial<ProviderSummary>
}) {
  const fallbackProviders = React.useMemo(() => rows.length, [rows])
  const fallbackTotalCost = React.useMemo(
    () => rows.reduce((a: number, b: any) => a + (b.totalCost ?? 0), 0),
    [rows]
  )
  const fallbackTotalRequests = React.useMemo(
    () => rows.reduce((a: number, b: any) => a + (b.requests ?? 0), 0),
    [rows]
  )

  const providers = summary?.total_number_of_providers ?? fallbackProviders
  const totalCost = summary?.total_cost ?? fallbackTotalCost
  const totalRequests = summary?.total_requests ?? fallbackTotalRequests
  const avgApprovalRate = summary?.average_approval_rate ?? 0

  return (
    <div className="w-full border-b border-[#EEF0F5]">
      <div className="grid grid-cols-4 px-6">
        <Stat label="Providers" value={fmtInt(providers)} />
        <Stat label="Total Cost" value={fmtNaira(totalCost)} />
        <Stat label="Total Requests" value={fmtInt(totalRequests)} />
        <Stat label="Avg. Approval Rate" value={`${avgApprovalRate}%`} />
      </div>
    </div>
  )
}
