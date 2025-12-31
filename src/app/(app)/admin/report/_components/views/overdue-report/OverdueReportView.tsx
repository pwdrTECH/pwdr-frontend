"use client"

import * as React from "react"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"

import { OverdueFiltersRow, type OverdueFilters } from "./OverdueFiltersRow"
import { OverdueStatsRow } from "./OverdueStatsRow"
import { OverdueTable } from "./OverdueTable"
import type { OverdueRow } from "./mock"

import { useOverdueReport } from "@/lib/api/reports"

const PAGE_SIZE = 20

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}
function toNumber(x: unknown) {
  if (typeof x === "number") return Number.isFinite(x) ? x : 0
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function parseCostRange(costRange: string) {
  if (!costRange || costRange === "__all__")
    return { min_cost: "", max_cost: "" }
  if (costRange === "0-100k") return { min_cost: "0", max_cost: "100000" }
  if (costRange === "100k-500k")
    return { min_cost: "100001", max_cost: "500000" }
  if (costRange === "500k-1m")
    return { min_cost: "500001", max_cost: "1000000" }
  if (costRange === "1m+") return { min_cost: "1000001", max_cost: "" }
  return { min_cost: "", max_cost: "" }
}

function mapApiToOverdueRow(
  item: Record<string, any>,
  index: number
): OverdueRow {
  return {
    id: String(item.id ?? item.request_id ?? `overdue-${index}`),
    requestId: String(item.request_id ?? item.requestId ?? "—"),
    enrolleeName: String(item.enrollee_name ?? item.enrolleeName ?? "—"),
    provider: String(item.provider_name ?? item.provider ?? "—"),
    schemeLabel: String(item.scheme ?? item.schemeLabel ?? "—"),
    submittedDate: String(item.submitted_date ?? item.submittedDate ?? "—"),
    submittedTime: String(item.submitted_time ?? item.submittedTime ?? "—"),
    daysOverdue: toNumber(item.days_overdue ?? item.daysOverdue ?? 0),
    totalCost: toNumber(item.total_cost ?? item.totalCost ?? 0),

    // keep for exports/filters if present later
    service: String(item.service ?? ""),
    location: String(item.location ?? ""),
    scheme: String(item.scheme ?? ""),
    plan: String(item.plan ?? ""),
    costRange: String(item.cost_range ?? ""),
  } as OverdueRow
}

export function OverdueReportView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [page, setPage] = React.useState(1)

  const [startDate] = React.useState<string>("")
  const [endDate] = React.useState<string>("")

  const [filters, setFilters] = React.useState<OverdueFilters>({
    service: "__all__",
    location: "__all__",
    scheme: "__all__",
    plan: "__all__",
    costRange: "__all__",
  })

  const cost = React.useMemo(
    () => parseCostRange(filters.costRange),
    [filters.costRange]
  )

  const apiFilters = React.useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      start_date: startDate,
      end_date: endDate,
      min_cost: cost.min_cost,
      max_cost: cost.max_cost,

      service: filters.service !== "__all__" ? filters.service : "",
      location: filters.location !== "__all__" ? filters.location : "",
      scheme: filters.scheme !== "__all__" ? filters.scheme : "",
      plan: filters.plan !== "__all__" ? filters.plan : "",
    }),
    [page, startDate, endDate, cost.min_cost, cost.max_cost, filters]
  )

  const overdueQuery = useOverdueReport(apiFilters)

  const summary = overdueQuery.data?.data?.summary
  const pagination = overdueQuery.data?.data?.pagination

  const apiList = React.useMemo(() => {
    const list = overdueQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : []
  }, [overdueQuery.data?.data?.line_listing])

  const rows = React.useMemo<OverdueRow[]>(() => {
    let mapped = apiList.map((it, i) => mapApiToOverdueRow(it, i))

    // local search (requestId, enrollee, provider)
    const s = q.trim().toLowerCase()
    if (s) {
      mapped = mapped.filter(
        (r) =>
          String(r.requestId ?? "")
            .toLowerCase()
            .includes(s) ||
          String(r.enrolleeName ?? "")
            .toLowerCase()
            .includes(s) ||
          String(r.provider ?? "")
            .toLowerCase()
            .includes(s)
      )
    }

    return mapped
  }, [apiList, q])

  // EXPORT CONFIG (exports current page result)
  React.useEffect(() => {
    setConfig({
      fileName: "Overdue Report",
      sheetName: "Overdue Report",
      format: "xlsx",
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
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <OverdueFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      {/* if you want, update stats to accept summary like SchemeStatsRow */}
      <OverdueStatsRow rows={rows as any} summary={summary as any} />

      <OverdueTable
        rows={rows}
        page={pagination?.current_page ?? page}
        onPageChange={setPage}
        totalItems={pagination?.total ?? rows.length}
        pageSize={pagination?.per_page ?? PAGE_SIZE}
      />
    </div>
  )
}
