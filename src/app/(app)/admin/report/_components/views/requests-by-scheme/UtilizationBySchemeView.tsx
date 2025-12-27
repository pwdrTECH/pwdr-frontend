"use client"

import * as React from "react"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"

import { SchemeFiltersRow, type SchemeFilters } from "./SchemeFiltersRow"
import { SchemeStatsRow } from "./SchemeStatsRow"
import { SchemeTable } from "./SchemeTable"
import { TopSchemesCard } from "./TopSchemesCard"

import {
  MOCK_SCHEME_ROWS,
  MOCK_TOP_SCHEMES_SERIES,
  type UtilSchemeRow,
} from "./mock"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function UtilizationBySchemeView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()
  const [range, setRange] = React.useState<RangeKey>("month")

  const [filters, setFilters] = React.useState<SchemeFilters>({
    service: "__all__",
    location: "__all__",
    scheme: "__all__",
    plan: "__all__",
    costRange: "__all__",
  })

  const rows = React.useMemo(() => {
    let filtered = MOCK_SCHEME_ROWS as UtilSchemeRow[]

    // search (enrollee name)
    const s = q.trim().toLowerCase()
    if (s) {
      filtered = filtered.filter((r) =>
        r.enrolleeName.toLowerCase().includes(s)
      )
    }

    if (filters.service !== "__all__") {
      filtered = filtered.filter((r) => r.service === filters.service)
    }
    if (filters.location !== "__all__") {
      filtered = filtered.filter((r) => r.location === filters.location)
    }
    if (filters.scheme !== "__all__") {
      filtered = filtered.filter((r) => r.scheme === filters.scheme)
    }
    if (filters.plan !== "__all__") {
      filtered = filtered.filter((r) => r.plan === filters.plan)
    }
    if (filters.costRange !== "__all__") {
      filtered = filtered.filter((r) => r.costRange === filters.costRange)
    }

    return filtered
  }, [q, filters])

  // ✅ EXPORT CONFIG (filtered rows)
  React.useEffect(() => {
    setConfig({
      fileName: "Utilization by Scheme",
      sheetName: "Utilization by Scheme",
      format: "xlsx", // or "csv"
      columns: [
        { header: "Scheme", value: (r: UtilSchemeRow) => r.schemeLabel },
        { header: "Plan", value: (r: UtilSchemeRow) => r.planLabel },
        { header: "Enrollee", value: (r: UtilSchemeRow) => r.enrolleeName },
        {
          header: "Total Requests",
          value: (r: UtilSchemeRow) => r.totalRequests,
        },
        {
          header: "Total Cost",
          value: (r: UtilSchemeRow) => fmtNaira(r.totalCost),
        },
        {
          header: "Avg Cost / Enrollee",
          value: (r: UtilSchemeRow) => fmtNaira(r.avgCostPerEnrollee),
        },
        {
          header: "Approval Rate",
          value: (r: UtilSchemeRow) => r.approvalRateLabel,
        },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <SchemeFiltersRow value={filters} onChange={setFilters} />
      <SchemeStatsRow rows={rows} />
      <SchemeTable rows={rows} />

      <div className="px-6 py-6">
        <TopSchemesCard
          data={MOCK_TOP_SCHEMES_SERIES}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
