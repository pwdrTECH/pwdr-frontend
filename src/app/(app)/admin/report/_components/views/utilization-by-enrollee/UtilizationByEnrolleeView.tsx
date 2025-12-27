"use client"

import * as React from "react"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"

import {
  UtilizationEnrolleeTable,
  type UtilRow,
} from "./UtilizationEnrolleeTable"
import { UtilizationFiltersRow } from "./UtilizationFiltersRow"
import { UtilizationStatsRow } from "./UtilizationStatsRow"
import { TopUtilizationCard } from "./charts/TopUtilizationCard"

import { MOCK_TOP7_UTIL, MOCK_UTIL_ENROLLEE_ROWS } from "./mock"

type Filters = {
  service: string
  location: string
  scheme: string
  plan: string
  dateRange: string
  costRange: string
}

type MockUtilRow = {
  id: string
  enrolleeName: string
  enrolleeId: string
  scheme: string
  plan: string
  provider: string
  providerExtraCount?: number
  location: string

  premium: number
  utilization: number
  usedPct: number
  balance: number

  service?: string
}

type TopItem = {
  id: string
  name: string
  code?: string
  total: number
  percent: number
  color: string
  avatarUrl?: string
}

function inCostRange(cost: number, range: string) {
  if (!range || !cost) return true
  if (range === "0-100k") return cost <= 100_000
  if (range === "100k-500k") return cost > 100_000 && cost <= 500_000
  if (range === "500k-1m") return cost > 500_000 && cost <= 1_000_000
  if (range === "1m+") return cost > 1_000_000
  return true
}

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

/**
 * Report → Utilization → By Enrollee
 */
export function UtilizationByEnrolleeView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")

  const [filters, setFilters] = React.useState<Filters>({
    service: "",
    location: "",
    scheme: "",
    plan: "",
    dateRange: "",
    costRange: "",
  })

  const rows = React.useMemo<MockUtilRow[]>(() => {
    let filtered = (MOCK_UTIL_ENROLLEE_ROWS as MockUtilRow[]) ?? []

    // search
    const s = q.trim().toLowerCase()
    if (s) {
      filtered = filtered.filter(
        (r) =>
          r.enrolleeName.toLowerCase().includes(s) ||
          r.enrolleeId.toLowerCase().includes(s)
      )
    }

    if (filters.service) {
      filtered = filtered.filter((r) => r.service === filters.service)
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase()
      filtered = filtered.filter((r) => r.location.toLowerCase() === loc)
    }

    if (filters.scheme) {
      filtered = filtered.filter((r) => r.scheme === filters.scheme)
    }

    if (filters.plan) {
      filtered = filtered.filter((r) => r.plan === filters.plan)
    }

    if (filters.costRange) {
      filtered = filtered.filter((r) =>
        inCostRange(Number(r.utilization), filters.costRange)
      )
    }

    return filtered
  }, [q, filters])

  // table rows (UI-only)
  const tableRows = React.useMemo<UtilRow[]>(
    () =>
      rows.map((r) => ({
        id: r.id,
        enrolleeName: r.enrolleeName,
        enrolleeId: r.enrolleeId,
        scheme: r.scheme,
        plan: r.plan,
        provider: r.provider,
        providerExtraCount: r.providerExtraCount ?? 0,
        location: r.location,
        utilization: r.utilization,
        usedPct: r.usedPct,
        balance: r.balance,
      })),
    [rows]
  )

  // EXPORT CONFIG
  React.useEffect(() => {
    setConfig({
      fileName: "Utilization by Enrollee",
      sheetName: "Utilization by Enrollee",
      format: "xlsx",
      columns: [
        { header: "Enrollee Name", value: (r: MockUtilRow) => r.enrolleeName },
        { header: "Enrollee ID", value: (r: MockUtilRow) => r.enrolleeId },
        { header: "Scheme", value: (r: MockUtilRow) => r.scheme },
        { header: "Plan", value: (r: MockUtilRow) => r.plan },
        { header: "Provider", value: (r: MockUtilRow) => r.provider },
        { header: "Location", value: (r: MockUtilRow) => r.location },
        { header: "Premium", value: (r: MockUtilRow) => fmtNaira(r.premium) },
        {
          header: "Utilization",
          value: (r: MockUtilRow) => fmtNaira(r.utilization),
        },
        {
          header: "Utilization %",
          value: (r: MockUtilRow) => `${r.usedPct}%`,
        },
        { header: "Balance", value: (r: MockUtilRow) => fmtNaira(r.balance) },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  const top7 = React.useMemo<TopItem[]>(
    () => (MOCK_TOP7_UTIL as TopItem[]) ?? [],
    []
  )

  return (
    <div className="w-full">
      <UtilizationFiltersRow value={filters} onChange={setFilters} />

      <UtilizationStatsRow
        rows={rows.map((r) => ({
          premium: r.premium,
          utilization: r.utilization,
          usedPct: r.usedPct,
          balance: r.balance,
        }))}
      />

      <UtilizationEnrolleeTable rows={tableRows} />

      <div className="p-6">
        <TopUtilizationCard
          data={top7}
          range={range}
          onRangeChange={setRange}
          title="Top 7 Enrollee Utilization"
        />
      </div>
    </div>
  )
}
