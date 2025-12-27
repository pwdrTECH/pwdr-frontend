"use client"

import * as React from "react"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"

import {
  OrganizationFiltersRow,
  type OrgFilters,
} from "./OrganizationFiltersRow"
import { OrganizationStatsRow } from "./OrganizationStatsRow"
import { OrganizationTable } from "./OrganizationTable"
import { Top7OrganizationsByUtilizationCard } from "./Top7OrganizationsByUtilizationCard"

import {
  MOCK_ORG_ROWS,
  MOCK_ORG_CLAIMS_SERIES,
  MOCK_TOP7_ORGS,
  type OrgRow,
} from "./mock"

import type { RangeKey } from "../requests-by-provider/StatusRangePills"
import { ClaimsComparisonCard } from "../../reports/chart/ClaimsComparisonCard"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function UtilizationByOrganizationView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")

  const [filters, setFilters] = React.useState<OrgFilters>({
    service: "__all__",
    location: "__all__",
    scheme: "__all__",
    plan: "__all__",
    costRange: "__all__",
  })

  const rows = React.useMemo<OrgRow[]>(() => {
    let filtered = MOCK_ORG_ROWS

    const s = q.trim().toLowerCase()
    if (s) {
      filtered = filtered.filter((r) =>
        r.organization.toLowerCase().includes(s)
      )
    }

    if (filters.service !== "__all__")
      filtered = filtered.filter((r) => r.service === filters.service)

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

  // EXPORT CONFIG (filtered rows)
  React.useEffect(() => {
    setConfig({
      fileName: "Utilization by Organization",
      sheetName: "Utilization by Organization",
      format: "xlsx",
      columns: [
        { header: "Organization", value: (r) => r.organization },
        { header: "Scheme", value: (r) => r.scheme },
        { header: "Plan", value: (r) => r.plan },
        { header: "Location", value: (r) => r.location },
        {
          header: "Total Requests",
          value: (r) => r.totalRequests,
        },
        {
          header: "Approved Claims",
          value: (r) => r.approvedClaims,
        },
        {
          header: "Denied Claims",
          value: (r) => r.deniedClaims,
        },
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
      <OrganizationFiltersRow value={filters} onChange={setFilters} />
      <OrganizationStatsRow rows={rows} />
      <OrganizationTable rows={rows} />

      <div className="px-6 py-6 space-y-6">
        <ClaimsComparisonCard
          data={MOCK_ORG_CLAIMS_SERIES}
          curveType="linear"
        />

        <Top7OrganizationsByUtilizationCard
          data={MOCK_TOP7_ORGS}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
