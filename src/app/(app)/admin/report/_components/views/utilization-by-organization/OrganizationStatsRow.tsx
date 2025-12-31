"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { OrgRow } from "./mock"

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}
function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function toNumber(x: any) {
  if (typeof x === "number") return x
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
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
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="text-[12px] leading-[18px] text-[#667085]">{label}</div>
      <div
        className={cn(
          "text-[16px] leading-[24px] font-semibold text-[#101828]",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  )
}

type ApiSummary = {
  total_organizations?: number
  total_cost?: number
  total_requests?: number
  avg_approval_rate?: number

  // tolerant aliases (if backend uses others)
  total_number_of_organizations?: number
  total_claims_amount?: number
  total_requests_count?: number
  approval_rate?: number
  [key: string]: any
}

export function OrganizationStatsRow({
  rows,
  summary,
}: {
  rows: OrgRow[]
  summary?: ApiSummary
}) {
  const computed = React.useMemo(() => {
    const totalOrganizations = new Set(rows.map((r) => r.organization)).size
    const totalCost = rows.reduce(
      (a, r) =>
        a + toNumber((r as any).totalCost ?? (r as any).utilizationCost ?? 0),
      0
    )
    const totalRequests = rows.reduce(
      (a, r) =>
        a + toNumber((r as any).requests ?? (r as any).totalRequests ?? 0),
      0
    )

    // If rows include approved/denied we can compute approval rate
    const approved = rows.reduce(
      (a, r) => a + toNumber((r as any).approvedClaims ?? 0),
      0
    )
    const denied = rows.reduce(
      (a, r) => a + toNumber((r as any).deniedClaims ?? 0),
      0
    )
    const denom = approved + denied
    const avgApprovalRate = denom > 0 ? Math.round((approved / denom) * 100) : 0

    return { totalOrganizations, totalCost, totalRequests, avgApprovalRate }
  }, [rows])

  const shown = React.useMemo(() => {
    if (!summary) return computed

    const totalOrganizations =
      toNumber(
        summary.total_organizations ?? summary.total_number_of_organizations
      ) || computed.totalOrganizations

    const totalCost =
      toNumber(summary.total_cost ?? summary.total_claims_amount) ||
      computed.totalCost

    const totalRequests =
      toNumber(summary.total_requests ?? summary.total_requests_count) ||
      computed.totalRequests

    const avgApprovalRate = Math.round(
      toNumber(summary.avg_approval_rate ?? summary.approval_rate) ||
        computed.avgApprovalRate
    )

    return { totalOrganizations, totalCost, totalRequests, avgApprovalRate }
  }, [summary, computed])

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-5">
      <div className="grid grid-cols-4 gap-6">
        <Stat
          label="Total Organizations"
          value={fmtInt(shown.totalOrganizations)}
        />
        <Stat label="Total Cost" value={fmtNaira(shown.totalCost)} />
        <Stat label="Total Requests" value={fmtInt(shown.totalRequests)} />
        <Stat label="Avg. Approval Rate" value={`${shown.avgApprovalRate}%`} />
      </div>
    </div>
  )
}
