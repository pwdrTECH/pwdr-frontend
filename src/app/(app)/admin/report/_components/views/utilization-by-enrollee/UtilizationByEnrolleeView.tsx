"use client"

import { useUtilizationByEnrollee } from "@/lib/api/reports"
import * as React from "react"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"
import {
  UtilizationEnrolleeTable,
  type UtilRow,
} from "./UtilizationEnrolleeTable"
import { UtilizationFiltersRow } from "./UtilizationFiltersRow"
import { UtilizationStatsRow } from "./UtilizationStatsRow"
import { TopUtilizationCard } from "./charts/TopUtilizationCard"

const PAGE_SIZE = 10
const EMPTY_LIST: any[] = []
const EMPTY_ROWS: UtilRow[] = []

type Filters = {
  service: string
  location: string
  scheme: string
  plan: string
  dateRange: string
  costRange: string
}

type TopItem = {
  id: string
  name: string
  code?: string
  total: number
  percent: number
  color: string
  avatarUrl?: string
}

function parseCostRange(costRange: string): {
  min_cost: string
  max_cost: string
} {
  if (!costRange) return { min_cost: "", max_cost: "" }
  if (costRange === "0-100k") return { min_cost: "0", max_cost: "100000" }
  if (costRange === "100k-500k")
    return { min_cost: "100001", max_cost: "500000" }
  if (costRange === "500k-1m")
    return { min_cost: "500001", max_cost: "1000000" }
  if (costRange === "1m+") return { min_cost: "1000001", max_cost: "" }
  if (costRange.endsWith("+"))
    return { min_cost: costRange.replace("+", ""), max_cost: "" }
  const [min, max] = costRange.split("-")
  return { min_cost: min ?? "", max_cost: max ?? "" }
}

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function toNumber(x: any) {
  if (typeof x === "number") return x
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function mapApiToUtilRow(item: Record<string, any>, index: number): UtilRow {
  const enrolleeName = String(item.enrolee_name ?? "—")
  const enrolleeId = String(item.enrolee_id ?? "")

  return {
    id: String(item.id ?? `${enrolleeId}-${index}`),
    enrolleeName,
    enrolleeId,
    scheme: String(item.scheme ?? ""),
    plan: String(item.plan ?? ""),
    provider: String(item.provider ?? "—"),
    providerExtraCount: 0, // not provided by API currently
    location: String(item.location ?? ""),
    cost: toNumber(item.cost ?? 0),
    utilizationRate: toNumber(item.utilization_rate ?? 0),
    balance: toNumber(item.balance ?? 0),
  }
}

export function UtilizationByEnrolleeView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")
  const [page, setPage] = React.useState(1)

  // wire to your ReportShell date pickers if available
  const [startDate] = React.useState<string>("")
  const [endDate] = React.useState<string>("")

  const [filters, setFilters] = React.useState<Filters>({
    service: "",
    location: "",
    scheme: "",
    plan: "",
    dateRange: "",
    costRange: "",
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
      patient_id: "",
      patient_name: "",
      plan: filters.plan ?? "",
      scheme: filters.scheme ?? "",
      min_cost: cost.min_cost,
      max_cost: cost.max_cost,
    }),
    [
      page,
      startDate,
      endDate,
      filters.plan,
      filters.scheme,
      cost.min_cost,
      cost.max_cost,
    ]
  )

  const utilQuery = useUtilizationByEnrollee(apiFilters)

  const summary = utilQuery.data?.data?.summary
  const pagination = utilQuery.data?.data?.pagination

  const apiList = React.useMemo(() => {
    const list = utilQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : EMPTY_LIST
  }, [utilQuery.data?.data?.line_listing])

  const tableRows = React.useMemo<UtilRow[]>(() => {
    if (!apiList.length) return EMPTY_ROWS

    let mapped = apiList.map((it, i) => mapApiToUtilRow(it, i))

    // search
    const s = q.trim().toLowerCase()
    if (s) {
      mapped = mapped.filter(
        (r) =>
          r.enrolleeName.toLowerCase().includes(s) ||
          r.enrolleeId.toLowerCase().includes(s)
      )
    }

    // local-only UI filters (not in API spec)
    if (filters.location) {
      const loc = filters.location.toLowerCase()
      mapped = mapped.filter((r) => (r.location ?? "").toLowerCase() === loc)
    }

    // safety filters (if backend already filtered, this is harmless)
    if (filters.scheme)
      mapped = mapped.filter((r) => r.scheme === filters.scheme)
    if (filters.plan) mapped = mapped.filter((r) => r.plan === filters.plan)

    return mapped
  }, [apiList, q, filters])

  const rowsRef = React.useRef<UtilRow[] | null>(null)

  React.useEffect(() => {
    if (rowsRef.current === tableRows) return
    rowsRef.current = tableRows

    setConfig({
      fileName: "Utilization by Enrollee",
      sheetName: "Utilization by Enrollee",
      format: "xlsx",
      columns: [
        { header: "Enrollee Name", value: (r: UtilRow) => r.enrolleeName },
        { header: "Enrollee ID", value: (r: UtilRow) => r.enrolleeId },
        { header: "Scheme", value: (r: UtilRow) => r.scheme },
        { header: "Plan", value: (r: UtilRow) => r.plan },
        { header: "Provider", value: (r: UtilRow) => r.provider },
        { header: "Location", value: (r: UtilRow) => r.location },
        { header: "Cost", value: (r: UtilRow) => fmtNaira(r.cost) },
        {
          header: "Utilization %",
          value: (r: UtilRow) =>
            `${Math.round(Number(r.utilizationRate || 0))}%`,
        },
        { header: "Balance", value: (r: UtilRow) => fmtNaira(r.balance) },
      ],
      rows: () => tableRows,
    })

    return () => setConfig(null)
  }, [tableRows, setConfig])

  // Top 7 card (keep empty until backend provides it)
  const top7 = React.useMemo<TopItem[]>(() => [], [])

  return (
    <div className="w-full">
      <UtilizationFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />
      <UtilizationStatsRow
        rows={tableRows.map((r) => ({
          premium: 0,
          utilization: r.cost,
          usedPct: r.utilizationRate,
          balance: r.balance,
        }))}
        summary={summary as any}
      />
      <UtilizationEnrolleeTable
        rows={tableRows}
        page={pagination?.current_page ?? page}
        onPageChange={setPage}
        totalItems={pagination?.total ?? 0}
        pageSize={pagination?.per_page ?? PAGE_SIZE}
        loading={utilQuery.isLoading}
        error={
          utilQuery.isError ? (utilQuery.error as Error)?.message : undefined
        }
      />

      <div className="p-6">
        <TopUtilizationCard
          data={top7}
          range={range}
          onRangeChange={setRange}
          title="Top 7 Enrollee Utilization"
        />
      </div>
    </div>
  )
}
