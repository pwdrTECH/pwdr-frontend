"use client"

import * as React from "react"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"

import { useUtilizationByServices } from "@/lib/api/reports"

import { ServiceFiltersRow, type ServiceFilters } from "./ServiceFiltersRow"
import { ServiceInsightsCard } from "./ServiceInsightsCard"
import { ServiceStatsRow } from "./ServiceStatsRow"
import { ServiceTable } from "./ServiceTable"

import type { UtilServiceRow } from "./mock" // keep if that's where your UI row type is today

const PAGE_SIZE = 20
const EMPTY_LIST: any[] = []
const EMPTY_ROWS: UtilServiceRow[] = []

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function toNumber(x: any) {
  if (typeof x === "number") return x
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function inCostRange(amount: number, range: string) {
  if (!range || range === "all") return true
  if (range === "0-100k") return amount >= 0 && amount <= 100_000
  if (range === "100k-500k") return amount > 100_000 && amount <= 500_000
  if (range === "500k-1m") return amount > 500_000 && amount <= 1_000_000
  if (range === "1m+") return amount > 1_000_000
  return true
}

type ApiSummary = {
  total_number_of_services: number
  total_claims_amount: number
  average_service_cost: number
  most_used_service: string
}

type ApiLine = {
  service_name: string
  enrolee_id: string
  enrolee_name: string
  provider: string
  location: string
  cost: number
  // optional (may appear later)
  scheme?: string
  plan?: string
}

type ApiPagination = {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}
// --- types from API ---
type ApiTopService = {
  service_name: string
  enrolee_count: number | null
  utilization: number
}

type ApiMonthlyStat = {
  month: number
  month_name: string
  year: number
  services: Array<{
    service_name: string
    utilization: number
  }>
}

// --- UI expects this donut datum ---
export type TopServiceDatum = {
  key: string
  label: string
  value: number
  percent: number
  color: string
  enrolleeCount: number
}

// matches your ServiceInsightsCard monthly shape
export type MonthlyServiceCostPoint = {
  m: string
  s1?: number
  s2?: number
  s3?: number
  s4?: number
}

function mapApiLineToRow(item: ApiLine, index: number): UtilServiceRow {
  const service = String(item.service_name ?? "—")
  const enrolleeName = String(item.enrolee_name ?? "—")
  const requestId = `req-${index + 1}` // API does not provide request_id here

  return {
    id: `${item.enrolee_id}-${index}`,
    service,
    enrolleeName,
    requestId,
    provider: String(item.provider ?? "—"),
    location: String(item.location ?? "—"),
    cost: toNumber(item.cost),

    // filter helpers (keep if your table/filter expects them)
    f_service: service,
    f_location: String(item.location ?? ""),
    f_scheme: String(item.scheme ?? ""),
    f_plan: String(item.plan ?? ""),
  } as unknown as UtilServiceRow
}

const DONUT_COLORS = ["#1671D9", "#AAB511", "#D5314D", "#EAEAEA"]

function mapTopServices(apiTop: ApiTopService[]): TopServiceDatum[] {
  const list = Array.isArray(apiTop) ? apiTop : []

  const total = list.reduce((acc, x) => acc + toNumber(x.utilization), 0) || 1

  return list.map((x, i) => {
    const value = toNumber(x.utilization)
    const percent = Math.round((value / total) * 100)
    const isOthers = String(x.service_name ?? "").toLowerCase() === "others"

    return {
      key: String(x.service_name ?? `item-${i}`),
      label: String(x.service_name ?? "—"),
      value,
      percent,
      color: isOthers ? "#EAEAEA" : DONUT_COLORS[i] ?? "#EAEAEA",
      enrolleeCount: typeof x.enrolee_count === "number" ? x.enrolee_count : 0,
    }
  })
}

function mapMonthlyStatistics(
  monthly: ApiMonthlyStat[],
  top: TopServiceDatum[]
): MonthlyServiceCostPoint[] {
  if (!Array.isArray(monthly) || monthly.length === 0) return []

  // keep a stable mapping for s1..s4 based on CURRENT top list order
  const keys = top.slice(0, 4).map((t) => t.label)

  const keyToSlot = new Map<string, "s1" | "s2" | "s3" | "s4">()
  if (keys[0]) keyToSlot.set(keys[0], "s1")
  if (keys[1]) keyToSlot.set(keys[1], "s2")
  if (keys[2]) keyToSlot.set(keys[2], "s3")
  if (keys[3]) keyToSlot.set(keys[3], "s4")

  return monthly.map((m) => {
    const row: MonthlyServiceCostPoint = {
      m: String(m.month_name ?? m.month ?? ""),
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
    }

    for (const s of m.services ?? []) {
      const name = String(s.service_name ?? "")
      const slot = keyToSlot.get(name)

      if (slot) row[slot] = toNumber(s.utilization)
      else {
        if (keys[3]) row.s4 = toNumber(row.s4) + toNumber(s.utilization)
      }
    }

    return row
  })
}

export function UtilizationByServiceView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")
  const [page, setPage] = React.useState(1)

  // wire to shell date pickers when available
  const [startDate] = React.useState<string>("")
  const [endDate] = React.useState<string>("")

  const [filters, setFilters] = React.useState<ServiceFilters>({
    service: "all",
    location: "all",
    scheme: "all",
    plan: "all",
    dateRange: "may-sep-2025",
    costRange: "all",
  })

  const apiFilters = React.useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      start_date: startDate,
      end_date: endDate,
      service: filters.service === "all" ? "" : filters.service,
      location: filters.location === "all" ? "" : filters.location,
      scheme: filters.scheme === "all" ? "" : filters.scheme,
      plan: filters.plan === "all" ? "" : filters.plan,
    }),
    [page, startDate, endDate, filters]
  )

  const utilQuery = useUtilizationByServices(apiFilters)

  const pagination: ApiPagination | undefined = utilQuery.data?.data?.pagination
  const summary: ApiSummary | undefined = utilQuery.data?.data?.summary
  const apiTopServices: ApiTopService[] =
    utilQuery.data?.data?.top_services ?? []
  const top = React.useMemo(
    () => mapTopServices(apiTopServices),
    [apiTopServices]
  )

  const apiMonthlyStats: ApiMonthlyStat[] =
    (utilQuery.data?.data as any)?.monthly_statistics ?? []

  const monthly = React.useMemo(
    () => mapMonthlyStatistics(apiMonthlyStats, top),
    [apiMonthlyStats, top]
  )
  const apiList: ApiLine[] = React.useMemo(() => {
    const list = utilQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : EMPTY_LIST
  }, [utilQuery.data?.data?.line_listing])

  const rows = React.useMemo<UtilServiceRow[]>(() => {
    if (!apiList.length) return EMPTY_ROWS

    let mapped = apiList.map((it, i) => mapApiLineToRow(it, i))

    // local search
    const s = q.trim().toLowerCase()
    if (s) {
      mapped = mapped.filter((r: any) =>
        [r.service, r.enrolleeName, r.requestId, r.provider, r.location]
          .join(" ")
          .toLowerCase()
          .includes(s)
      )
    }

    // client-side cost range filter (API currently doesn’t support it)
    if (filters.costRange !== "all") {
      mapped = mapped.filter((r: any) =>
        inCostRange(toNumber(r.cost ?? 0), filters.costRange)
      )
    }

    return mapped
  }, [apiList, q, filters.costRange])

  // Export config
  const rowsRef = React.useRef<UtilServiceRow[] | null>(null)
  React.useEffect(() => {
    if (rowsRef.current === rows) return
    rowsRef.current = rows

    setConfig({
      fileName: "Utilization by Service",
      sheetName: "Utilization by Service",
      format: "xlsx",
      columns: [
        { header: "Service", value: (r: any) => r.service },
        { header: "Enrollee", value: (r: any) => r.enrolleeName },
        { header: "Request ID", value: (r: any) => r.requestId },
        { header: "Provider", value: (r: any) => r.provider },
        { header: "Location", value: (r: any) => r.location },
        { header: "Cost", value: (r: any) => fmtNaira(toNumber(r.cost)) },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <ServiceFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      {/*  use API summary for stats (fallback to rows if summary missing) */}
      <ServiceStatsRow
        rows={rows}
        summary={
          summary
            ? {
                total_number_of_services: toNumber(
                  summary.total_number_of_services
                ),
                total_claims_amount: toNumber(summary.total_claims_amount),
                average_service_cost: toNumber(summary.average_service_cost),
                most_used_service: String(summary.most_used_service ?? ""),
              }
            : undefined
        }
      />

      <ServiceTable
        rows={rows}
        page={pagination?.current_page ?? page}
        onPageChange={setPage}
        totalItems={pagination?.total ?? 0}
        pageSize={pagination?.per_page ?? PAGE_SIZE}
        loading={utilQuery.isLoading}
        error={
          utilQuery.isError ? (utilQuery.error as Error)?.message : undefined
        }
      />

      <div className="px-6 py-6 space-y-6">
        <ServiceInsightsCard
          top={top}
          monthly={monthly}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
