"use client"

import * as React from "react"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"

import { ServiceFiltersRow, type ServiceFilters } from "./ServiceFiltersRow"
import { ServiceInsightsCard } from "./ServiceInsightsCard"
import { ServiceStatsRow } from "./ServiceStatsRow"
import { ServiceTable } from "./ServiceTable"

import {
  MOCK_SERVICE_MONTHLY,
  MOCK_TOP_SERVICES,
  MOCK_UTIL_SERVICE_ROWS,
  type UtilServiceRow,
} from "./mock"

function inCostRange(amount: number, range: string) {
  if (!range || range === "all") return true
  if (range === "0-100k") return amount >= 0 && amount <= 100_000
  if (range === "100k-500k") return amount > 100_000 && amount <= 500_000
  if (range === "500k-1m") return amount > 500_000 && amount <= 1_000_000
  if (range === "1m+") return amount > 1_000_000
  return true
}

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function UtilizationByServiceView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()
  const [range, setRange] = React.useState<RangeKey>("month")

  const [filters, setFilters] = React.useState<ServiceFilters>({
    service: "all",
    location: "all",
    scheme: "all",
    plan: "all",
    dateRange: "may-sep-2025",
    costRange: "all",
  })

  const rows = React.useMemo<UtilServiceRow[]>(() => {
    let filtered = MOCK_UTIL_SERVICE_ROWS

    // search
    const s = q.trim().toLowerCase()
    if (s) {
      filtered = filtered.filter((r) =>
        [r.service, r.enrolleeName, r.requestId, r.provider, r.location]
          .join(" ")
          .toLowerCase()
          .includes(s)
      )
    }

    //  filters
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
        inCostRange(Number(r.cost ?? 0), filters.costRange)
      )

    return filtered
  }, [q, filters])

  React.useEffect(() => {
    setConfig({
      fileName: "Utilization by Service",
      sheetName: "Utilization by Service",
      format: "xlsx",
      columns: [
        { header: "Service", value: (r) => r.service },
        { header: "Enrollee", value: (r) => r.enrolleeName },
        { header: "Request ID", value: (r) => r.requestId },
        { header: "Provider", value: (r) => r.provider },
        { header: "Location", value: (r) => r.location },
        { header: "Cost", value: (r) => fmtNaira(r.cost) },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <ServiceFiltersRow value={filters} onChange={setFilters} />
      <ServiceStatsRow rows={rows} />
      <ServiceTable rows={rows} />

      <div className="px-6 py-6 space-y-6">
        <ServiceInsightsCard
          top={MOCK_TOP_SERVICES}
          monthly={MOCK_SERVICE_MONTHLY}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
