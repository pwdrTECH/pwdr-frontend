"use client"

import { useProviderRequests } from "@/lib/api/reports"
import * as React from "react"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { ProviderFiltersRow } from "./ProviderFiltersRow"
import { ProviderStatsRow } from "./ProviderStatsRow"
import { ProviderTable } from "./ProviderTable"
import type { RangeKey } from "./StatusRangePills"
import { MonthlyRequestsCostsCard } from "./charts/MonthlyRequestsAndCostsCard"
import {
  StatusComparisonCard,
  type StatusDatum,
} from "./charts/StatusComparisonCard"
import type { ProviderRow } from "./mock"

const PAGE_SIZE = 10
const EMPTY_LIST: any[] = []
const EMPTY_ROWS: ProviderRow[] = []

type Filters = { service: string; location: string }
type ProviderSeriesPoint = { m: string; requests: number; cost: number }

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}
function toNumber(x: any) {
  if (typeof x === "number") return x
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function pct(part: number, total: number) {
  if (!total || total <= 0) return "0%"
  return `${Math.round((part / total) * 100)}%`
}

function mapApiToProviderRow(
  item: Record<string, any>,
  index: number,
): ProviderRow {
  const providerName = String(item.provider_name ?? "—")
  const providerCode = String(item.provider_code ?? "")

  const totalRequests = toNumber(item.total_requests_count ?? 0)
  const approved = toNumber(item.approved_count ?? 0)
  const denied = toNumber(item.denied_count ?? 0)

  const approvalRate = toNumber(item.approval_rate ?? 0)
  const estimatedCost = toNumber(item.total_estimated_cost ?? 0)

  return {
    id: String(item.id ?? providerCode ?? `${providerName}-${index}`),
    providerName,
    providerCode,
    totalRequests,
    approved,
    denied,
    approvalRate,
    estimatedCost,
    service: String(item.service ?? ""),
    location: String(item.location ?? ""),
  }
}
function buildProviderStatusData(
  summary: any,
  rows: ProviderRow[],
): StatusDatum[] {
  const totalCount = toNumber(summary?.total_requests_count ?? 0)

  const deniedCount = rows.reduce((a, r) => a + toNumber(r.denied), 0)
  const approvedCount = rows.reduce((a, r) => a + toNumber(r.approved), 0)
  const pendingCount = Math.max(0, totalCount - approvedCount - deniedCount)

  const approvedAmount = toNumber(summary?.total_approved_amount ?? 0)

  return [
    {
      key: "approved",
      label: "Approved",
      value: approvedCount,
      amount: fmtNaira(approvedAmount),
      percentChip: pct(approvedCount, totalCount),
      color: "#02A32D",
    },
    {
      key: "denied",
      label: "Denied",
      value: deniedCount,
      amount: "—",
      percentChip: pct(deniedCount, totalCount),
      color: "#F85E5E",
    },
    {
      key: "pending",
      label: "Pending",
      value: pendingCount,
      amount: "—",
      percentChip: pct(pendingCount, totalCount),
      color: "#F4BF13",
    },
    {
      key: "queried",
      label: "Queried",
      value: 0,
      amount: "—",
      percentChip: "0%",
      color: "#1671D9",
    },
  ]
}

export function RequestsByProviderView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")
  const [page, setPage] = React.useState(1)

  const [startDate] = React.useState<string>("")
  const [endDate] = React.useState<string>("")

  const [filters, setFilters] = React.useState<Filters>({
    service: "",
    location: "",
  })

  const apiFilters = React.useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      start_date: startDate,
      end_date: endDate,
      patient_id: "",
      patient_name: "",
    }),
    [page, startDate, endDate],
  )

  const reqQuery = useProviderRequests(apiFilters)

  const summary = reqQuery.data?.data?.summary
  const pagination = reqQuery.data?.data?.pagination

  const apiList = React.useMemo(() => {
    const list = reqQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : EMPTY_LIST
  }, [reqQuery.data?.data?.line_listing])

  const rows = React.useMemo(() => {
    if (!apiList.length) return EMPTY_ROWS

    let mapped = apiList.map((it, i) => mapApiToProviderRow(it, i))

    const s = q.trim().toLowerCase()
    if (s) {
      mapped = mapped.filter(
        (r) =>
          r.providerName.toLowerCase().includes(s) ||
          r.providerCode.toLowerCase().includes(s),
      )
    }

    if (filters.service)
      mapped = mapped.filter((r) => (r.service ?? "") === filters.service)
    if (filters.location)
      mapped = mapped.filter((r) => (r.location ?? "") === filters.location)

    return mapped
  }, [apiList, q, filters])

  const statusData = React.useMemo(
    () => buildProviderStatusData(summary, rows),
    [summary, rows],
  )

  React.useEffect(() => {
    setConfig({
      fileName: "Requests by Provider",
      sheetName: "Requests by Provider",
      format: "xlsx",
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
  }, [rows, setConfig])

  React.useEffect(() => {
    return () => setConfig(null)
  }, [setConfig])

  const series: ProviderSeriesPoint[] = React.useMemo(() => {
    const ms = reqQuery.data?.data?.monthly_statistics
    if (!Array.isArray(ms)) return []

    return [...ms]
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .map((it) => ({
        m: `${String(it.month_name).slice(0, 3)} ${it.year}`,
        requests: toNumber(it.visit_count), // ✅ chart expects "requests"
        cost: toNumber(it.total_cost), // ✅ chart expects "cost"
      }))
  }, [reqQuery.data?.data?.monthly_statistics])
  return (
    <div className="w-full h-full">
      <ProviderFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      <ProviderStatsRow rows={rows} />

      <ProviderTable
        rows={rows}
        page={pagination?.current_page ?? page}
        onPageChange={setPage}
        totalItems={pagination?.total ?? 0}
        pageSize={pagination?.per_page ?? PAGE_SIZE}
        loading={reqQuery.isLoading}
        error={
          reqQuery.isError ? (reqQuery.error as Error)?.message : undefined
        }
      />

      <div className="h-full px-6 py-6 space-y-[60px]">
        <MonthlyRequestsCostsCard
          data={series as any}
          range={range}
          onRangeChange={setRange}
        />

        <StatusComparisonCard
          data={statusData}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
