"use client"

import * as React from "react"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"

import { ProviderFiltersRow, type ProviderFilters } from "./ProviderFiltersRow"
import { ProviderStatsRow } from "./ProviderStatsRow"
import { ProviderTable } from "./ProviderTable"
import { RequestsChartCard } from "./RequestsChartCard"
import { ServicesOfferedByProvidersCard } from "./ServicesOfferedByProvidersCard"
import { Top7ProvidersByCostCard } from "./Top7ProvidersByCostCard"

import {
  MOCK_PROVIDER_ROWS,
  MOCK_PROVIDER_REQUESTS_SERIES,
  MOCK_PROVIDER_SERVICES_BARS,
  MOCK_TOP7_PROVIDERS_BY_COST,
  type UtilProviderRow,
} from "./mock"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function UtilizationByProviderView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")

  const [filters, setFilters] = React.useState<ProviderFilters>({
    location: "__all__",
    scheme: "__all__",
    plan: "__all__",
    dateRange: "__all__",
    costRange: "__all__",
  })

  const rows = React.useMemo<UtilProviderRow[]>(() => {
    let filtered = MOCK_PROVIDER_ROWS

    // search
    const s = q.trim().toLowerCase()
    if (s) {
      filtered = filtered.filter(
        (r) =>
          r.providerName.toLowerCase().includes(s) ||
          r.providerCode.toLowerCase().includes(s)
      )
    }

    // filters
    if (filters.location !== "__all__")
      filtered = filtered.filter((r) => r.location === filters.location)

    if (filters.scheme !== "__all__")
      filtered = filtered.filter((r) => r.scheme === filters.scheme)

    if (filters.plan !== "__all__")
      filtered = filtered.filter((r) => r.plan === filters.plan)

    if (filters.costRange !== "__all__")
      filtered = filtered.filter((r) => r.costRange === filters.costRange)

    return filtered
  }, [q, filters])

  // EXPORT CONFIG
  React.useEffect(() => {
    setConfig({
      fileName: "Utilization by Provider",
      sheetName: "Utilization by Provider",
      format: "xlsx",
      columns: [
        { header: "Provider", value: (r) => r.providerName },
        { header: "Provider Code", value: (r) => r.providerCode },
        { header: "Scheme", value: (r) => r.scheme },
        { header: "Plan", value: (r) => r.plan },
        { header: "Location", value: (r) => r.location },
        { header: "Total Requests", value: (r) => r.totalRequests },
        { header: "Approved Claims", value: (r) => r.approvedClaims },
        { header: "Denied Claims", value: (r) => r.deniedClaims },
        {
          header: "Utilization Cost",
          value: (r) => fmtNaira(r.utilizationCost),
        },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <ProviderFiltersRow value={filters} onChange={setFilters} />
      <ProviderStatsRow rows={rows} />
      <ProviderTable rows={rows} />

      <div className="px-6 py-6 space-y-6">
        <RequestsChartCard
          data={MOCK_PROVIDER_REQUESTS_SERIES}
          range={range}
          onRangeChange={setRange}
        />

        <ServicesOfferedByProvidersCard
          data={MOCK_PROVIDER_SERVICES_BARS}
          range={range}
          onRangeChange={setRange}
        />

        <Top7ProvidersByCostCard
          data={MOCK_TOP7_PROVIDERS_BY_COST}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
