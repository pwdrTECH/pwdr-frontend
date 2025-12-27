"use client"

import * as React from "react"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"

import { LocationFiltersRow, type LocationFilters } from "./LocationFiltersRow"
import { LocationStatsRow } from "./LocationStatsRow"
import { LocationTable } from "./LocationTable"
import { PerformanceByLocationCard } from "./PerformanceByLocationCard"

import {
  MOCK_LOCATION_PERFORMANCE,
  MOCK_UTILIZATION_LOCATION_ROWS,
  type UtilizationLocationRow,
} from "./mock"

import type { RangeKey } from "../requests-by-provider/StatusRangePills"

function inCostRange(amount: number, range: string) {
  if (!range || range === "all") return true
  if (range === "0-100k") return amount <= 100_000
  if (range === "100k-500k") return amount > 100_000 && amount <= 500_000
  if (range === "500k-1m") return amount > 500_000 && amount <= 1_000_000
  if (range === "1m+") return amount > 1_000_000
  return true
}

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function UtilizationByLocationView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")

  const [filters, setFilters] = React.useState<LocationFilters>({
    service: "all",
    location: "all",
    scheme: "all",
    plan: "all",
    dateRange: "may-sep-2025",
    costRange: "all",
  })

  const rows = React.useMemo<UtilizationLocationRow[]>(() => {
    let filtered = MOCK_UTILIZATION_LOCATION_ROWS

    // global search
    const s = q.trim().toLowerCase()
    if (s) {
      filtered = filtered.filter((r) =>
        `${r.location} ${r.scheme} ${r.provider} ${r.plan}`
          .toLowerCase()
          .includes(s)
      )
    }

    if (filters.service !== "all")
      filtered = filtered.filter((r) => r.f_service === filters.service)

    if (filters.location !== "all")
      filtered = filtered.filter((r) => r.f_location === filters.location)

    if (filters.scheme !== "all")
      filtered = filtered.filter((r) => r.f_scheme === filters.scheme)

    if (filters.plan !== "all")
      filtered = filtered.filter((r) => r.f_plan === filters.plan)

    if (filters.costRange !== "all")
      filtered = filtered.filter((r) =>
        inCostRange(r.approvedClaim, filters.costRange)
      )

    return filtered
  }, [q, filters])

  // EXPORT CONFIG
  React.useEffect(() => {
    setConfig({
      fileName: "Utilization by Location",
      sheetName: "Utilization by Location",
      format: "xlsx",
      columns: [
        { header: "Location", value: (r) => r.location },
        { header: "Scheme", value: (r) => r.scheme },
        { header: "Plan", value: (r) => r.plan },
        { header: "Provider", value: (r) => r.provider },
        {
          header: "Claims Count",
          value: (r) => r.claimsCount,
        },
        {
          header: "Enrollees",
          value: (r) => r.enrolleeCount,
        },
        {
          header: "Approved Claims Value",
          value: (r) => fmtNaira(r.approvedClaim),
        },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <LocationFiltersRow value={filters} onChange={setFilters} />
      <LocationStatsRow rows={rows} />
      <LocationTable rows={rows} />

      <div className="px-6 py-6">
        <PerformanceByLocationCard
          data={MOCK_LOCATION_PERFORMANCE}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
