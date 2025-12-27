"use client"

import * as React from "react"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"
import { OverdueFiltersRow, type OverdueFilters } from "./OverdueFiltersRow"
import { OverdueStatsRow } from "./OverdueStatsRow"
import { OverdueTable } from "./OverdueTable"
import { MOCK_OVERDUE_ROWS, type OverdueRow } from "./mock"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function OverdueReportView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [filters, setFilters] = React.useState<OverdueFilters>({
    service: "__all__",
    location: "__all__",
    scheme: "__all__",
    plan: "__all__",
    costRange: "__all__",
  })

  const rows = React.useMemo(() => {
    let filtered = MOCK_OVERDUE_ROWS as OverdueRow[]

    // search: allow requestId, enrollee, provider
    const s = q.trim().toLowerCase()
    if (s) {
      filtered = filtered.filter((r) => {
        return (
          r.requestId.toLowerCase().includes(s) ||
          r.enrolleeName.toLowerCase().includes(s) ||
          r.provider.toLowerCase().includes(s)
        )
      })
    }

    if (filters.service !== "__all__") {
      filtered = filtered.filter((r) => (r.service ?? "") === filters.service)
    }
    if (filters.location !== "__all__") {
      filtered = filtered.filter((r) => (r.location ?? "") === filters.location)
    }
    if (filters.scheme !== "__all__") {
      filtered = filtered.filter((r) => (r.scheme ?? "") === filters.scheme)
    }
    if (filters.plan !== "__all__") {
      filtered = filtered.filter((r) => (r.plan ?? "") === filters.plan)
    }
    if (filters.costRange !== "__all__") {
      filtered = filtered.filter(
        (r) => (r.costRange ?? "") === filters.costRange
      )
    }

    return filtered
  }, [q, filters])

  // EXPORT CONFIG (exports filtered rows)
  React.useEffect(() => {
    setConfig({
      fileName: "Overdue Report",
      sheetName: "Overdue Report",
      format: "xlsx", // or "csv"
      columns: [
        { header: "Request ID", value: (r: OverdueRow) => r.requestId },
        { header: "Enrollee", value: (r: OverdueRow) => r.enrolleeName },
        { header: "Provider", value: (r: OverdueRow) => r.provider },
        { header: "Scheme", value: (r: OverdueRow) => r.schemeLabel },
        { header: "Submitted Date", value: (r: OverdueRow) => r.submittedDate },
        { header: "Submitted Time", value: (r: OverdueRow) => r.submittedTime },
        { header: "Days Overdue", value: (r: OverdueRow) => r.daysOverdue },
        {
          header: "Total Cost",
          value: (r: OverdueRow) => fmtNaira(r.totalCost),
        },
        { header: "Service", value: (r: OverdueRow) => r.service ?? "" },
        { header: "Location", value: (r: OverdueRow) => r.location ?? "" },
        { header: "Plan", value: (r: OverdueRow) => r.plan ?? "" },
        { header: "Cost Range", value: (r: OverdueRow) => r.costRange ?? "" },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <OverdueFiltersRow value={filters} onChange={setFilters} />
      <OverdueStatsRow rows={rows} />
      <OverdueTable rows={rows} />
    </div>
  )
}
