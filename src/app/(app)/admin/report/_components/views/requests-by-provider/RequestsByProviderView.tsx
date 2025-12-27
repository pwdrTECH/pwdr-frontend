"use client"

import * as React from "react"
import { ProviderFiltersRow } from "./ProviderFiltersRow"
import { ProviderStatsRow } from "./ProviderStatsRow"
import { ProviderTable } from "./ProviderTable"
import { StatusComparisonCard } from "./charts/StatusComparisonCard"
import { MonthlyRequestsCostsCard } from "./charts/MonthlyRequestsAndCostsCard"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"
import type { RangeKey } from "./StatusRangePills"

import {
  MOCK_PROVIDER_ROWS,
  MOCK_PROVIDER_SERIES,
  MOCK_PROVIDER_STATUS,
} from "./mock"

export type ProviderRow = {
  id: string
  providerName: string
  providerCode: string
  totalRequests: number
  approved: number
  denied: number
  approvalRate: number
  estimatedCost: number
  service?: string
  location?: string
}

type Filters = { service: string; location: string }

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function RequestsByProviderView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()
  const [range, setRange] = React.useState<RangeKey>("month")

  const [filters, setFilters] = React.useState<Filters>({
    service: "",
    location: "",
  })

  const rows = React.useMemo(() => {
    let filtered = MOCK_PROVIDER_ROWS as ProviderRow[]

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
    if (filters.service) {
      filtered = filtered.filter((r) => (r.service ?? "") === filters.service)
    }
    if (filters.location) {
      filtered = filtered.filter((r) => (r.location ?? "") === filters.location)
    }

    return filtered
  }, [q, filters])

  React.useEffect(() => {
    setConfig({
      fileName: "Requests by Provider",
      sheetName: "Requests by Provider",
      format: "xlsx", // or "csv"
      columns: [
        { header: "Hospital", value: (r: ProviderRow) => r.providerName },
        { header: "Provider Code", value: (r: ProviderRow) => r.providerCode },
        {
          header: "Total Requests",
          value: (r: ProviderRow) => r.totalRequests,
        },
        { header: "Approved", value: (r: ProviderRow) => r.approved },
        { header: "Denied", value: (r: ProviderRow) => r.denied },
        {
          header: "Approval Rate (%)",
          value: (r: ProviderRow) => Number(r.approvalRate ?? 0),
        },
        {
          header: "Total Est. Cost",
          value: (r: ProviderRow) => fmtNaira(r.estimatedCost),
        },
        { header: "Service", value: (r: ProviderRow) => r.service ?? "" },
        { header: "Location", value: (r: ProviderRow) => r.location ?? "" },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full h-full">
      <ProviderFiltersRow value={filters} onChange={setFilters} />
      <ProviderStatsRow rows={rows} />
      <ProviderTable rows={rows} />

      <div className="h-full px-6 py-6 space-y-[60px]">
        <MonthlyRequestsCostsCard
          data={MOCK_PROVIDER_SERIES}
          range={range}
          onRangeChange={setRange}
        />

        <StatusComparisonCard
          data={MOCK_PROVIDER_STATUS}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
