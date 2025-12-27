"use client"

import * as React from "react"
import { ClaimsComparisonCard } from "../../reports/chart/ClaimsComparisonCard"
import { EnrolleeFiltersRow } from "./EnrolleeFiltersRow"
import { EnrolleeStatsRow } from "./EnrolleeStatsRow"
import { EnrolleeTable } from "./EnrolleeTable"
import { StatusComparisonCard } from "./StatusComparisonCard"
import { MOCK_ROWS, MOCK_SERIES } from "./mock"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"
import type { EnrolleeRow } from "./types"

type Filters = {
  service: string
  location: string
  scheme: string
  plan: string
  costRange: string
}

export function RequestsByEnrolleeView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [filters, setFilters] = React.useState<Filters>({
    service: "",
    location: "",
    scheme: "",
    plan: "",
    costRange: "",
  })

  const rows = React.useMemo(() => {
    let filtered = MOCK_ROWS as EnrolleeRow[]

    // search
    const s = q.trim().toLowerCase()
    if (s) {
      filtered = filtered.filter(
        (r) =>
          r.enrolleeName.toLowerCase().includes(s) ||
          r.enrolleeId.toLowerCase().includes(s) ||
          r.provider.toLowerCase().includes(s)
      )
    }

    // filters
    if (filters.service) {
      filtered = filtered.filter(
        (r: any) => (r.service ?? "") === filters.service
      )
    }
    if (filters.location) {
      filtered = filtered.filter(
        (r: any) => (r.location ?? "") === filters.location
      )
    }
    if (filters.scheme) {
      filtered = filtered.filter(
        (r: any) => (r.scheme ?? "") === filters.scheme
      )
    }
    if (filters.plan) {
      filtered = filtered.filter((r: any) => (r.plan ?? "") === filters.plan)
    }

    // costRange (same logic you had)
    if (filters.costRange) {
      const n = (x: any) => Number(x ?? 0)

      filtered = filtered.filter((r: any) => {
        const amt = n(r.amountClaimedNumber)
        if (!amt) return true

        if (filters.costRange === "0-100k") return amt >= 0 && amt <= 100_000
        if (filters.costRange === "100k-500k")
          return amt > 100_000 && amt <= 500_000
        if (filters.costRange === "500k-1m")
          return amt > 500_000 && amt <= 1_000_000
        if (filters.costRange === "1m+") return amt > 1_000_000
        return true
      })
    }

    return filtered
  }, [q, filters])

  React.useEffect(() => {
    setConfig({
      fileName: "Requests by Enrollee",
      sheetName: "Requests by Enrollee",
      format: "xlsx",
      columns: [
        { header: "Enrollee", value: (r: EnrolleeRow) => r.enrolleeName },
        { header: "Enrollee ID", value: (r: EnrolleeRow) => r.enrolleeId },
        { header: "Plan", value: (r: EnrolleeRow) => r.plan },
        { header: "Scheme", value: (r: EnrolleeRow) => r.scheme },
        { header: "Provider", value: (r: EnrolleeRow) => r.provider },
        {
          header: "Request Date",
          value: (r: EnrolleeRow) => r.requestDate ?? "",
        },
        {
          header: "Request Time",
          value: (r: EnrolleeRow) => r.requestTime ?? "",
        },
        { header: "Status", value: (r: EnrolleeRow) => r.status ?? "" },
        { header: "Amount Claimed", value: (r: EnrolleeRow) => r.amount ?? "" },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <EnrolleeFiltersRow value={filters} onChange={setFilters} />
      <EnrolleeStatsRow />
      <EnrolleeTable rows={rows} />

      <div className="px-6 py-6 space-y-10.5">
        <ClaimsComparisonCard data={MOCK_SERIES} />
        <StatusComparisonCard />
      </div>
    </div>
  )
}
