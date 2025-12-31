"use client"

import type { ProviderRow } from "./mock"

type ProviderSummary = {
  total_requests_count: number
  total_denied_count: number
  total_billed_amount: number
  total_approved_amount: number
  approval_rate: number
}

function fmtNaira(n: number) {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`
}

export function ProviderStatsRow({
  rows,
  summary,
}: {
  rows: ProviderRow[]
  summary?: Partial<ProviderSummary> | null
}) {
  // fallback from rows (keeps old behaviour)
  const totalRequestsFromRows = rows.reduce(
    (s, r) => s + (r.totalRequests || 0),
    0
  )
  const totalDeniedFromRows = rows.reduce((s, r) => s + (r.denied || 0), 0)
  const totalApprovedFromRows = rows.reduce((s, r) => s + (r.approved || 0), 0)
  const totalBilledFromRows = rows.reduce(
    (s, r) => s + (r.estimatedCost || 0),
    0
  )

  const approvalRateFromRows =
    totalRequestsFromRows > 0
      ? Math.round((totalApprovedFromRows / totalRequestsFromRows) * 100)
      : 0

  // prefer API summary when provided
  const totalRequests =
    typeof summary?.total_requests_count === "number"
      ? summary.total_requests_count
      : totalRequestsFromRows

  const totalDenied =
    typeof summary?.total_denied_count === "number"
      ? summary.total_denied_count
      : totalDeniedFromRows

  const totalBilled =
    typeof summary?.total_billed_amount === "number"
      ? summary.total_billed_amount
      : totalBilledFromRows

  // your API provides "total_approved_amount" (amount), but this card label is "Total Approved"
  // so we show the amount if it exists, otherwise fallback to count from rows.
  const approvedDisplay =
    typeof summary?.total_approved_amount === "number"
      ? fmtNaira(summary.total_approved_amount)
      : totalApprovedFromRows

  const approvalRate =
    typeof summary?.approval_rate === "number"
      ? summary.approval_rate
      : approvalRateFromRows

  const stats = [
    { label: "Total Requests", value: totalRequests.toLocaleString() },
    { label: "Total Denied", value: totalDenied.toLocaleString() },
    { label: "Total Billed", value: fmtNaira(totalBilled) },
    { label: "Total Approved", value: approvedDisplay },
    {
      label: "Approval Rate",
      value: `${Number(approvalRate || 0).toFixed(1)}%`,
    },
  ]

  return (
    <div className="grid grid-cols-5 gap-6 border-b border-[#EAECF0] px-6 py-4">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="text-[14px] text-[#7A7A7A]">{s.label}</div>
          <div className="text-[22px] font-semibold text-[#212123]">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  )
}
