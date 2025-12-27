"use client"

import type { ProviderRow } from "./RequestsByProviderView"

export function ProviderStatsRow({ rows }: { rows: ProviderRow[] }) {
  const totalRequests = rows.reduce((s, r) => s + r.totalRequests, 0)
  const totalDenied = rows.reduce((s, r) => s + r.denied, 0)
  const totalApproved = rows.reduce((s, r) => s + r.approved, 0)
  const totalBilled = rows.reduce((s, r) => s + r.estimatedCost, 0)

  const approvalRate =
    totalRequests > 0 ? Math.round((totalApproved / totalRequests) * 100) : 0

  const stats = [
    { label: "Total Requests", value: totalRequests },
    { label: "Total Denied", value: totalDenied },
    { label: "Total Billed", value: `₦${totalBilled.toLocaleString()}` },
    { label: "Total Approved", value: totalApproved },
    { label: "Approval Rate", value: `${approvalRate}%` },
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
