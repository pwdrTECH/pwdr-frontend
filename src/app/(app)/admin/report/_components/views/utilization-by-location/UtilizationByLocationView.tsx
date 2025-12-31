"use client"

import * as React from "react"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"
import { useUtilizationByLocation } from "@/lib/api/reports"
import { LocationFiltersRow, type LocationFilters } from "./LocationFiltersRow"
import { LocationStatsRow, type LocationSummary } from "./LocationStatsRow"
import { LocationTable, type UtilizationLocationRow } from "./LocationTable"
import { PerformanceByLocationCard } from "./PerformanceByLocationCard"

const PAGE_SIZE = 10
const EMPTY_LIST: any[] = []
const EMPTY_ROWS: UtilizationLocationRow[] = []

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function toNumber(x: any) {
  if (typeof x === "number") return x
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function parseCostRange(costRange: string): {
  min_cost: string
  max_cost: string
} {
  if (!costRange || costRange === "all") return { min_cost: "", max_cost: "" }
  if (costRange === "0-100k") return { min_cost: "0", max_cost: "100000" }
  if (costRange === "100k-500k")
    return { min_cost: "100001", max_cost: "500000" }
  if (costRange === "500k-1m")
    return { min_cost: "500001", max_cost: "1000000" }
  if (costRange === "1m+") return { min_cost: "1000001", max_cost: "" }
  return { min_cost: "", max_cost: "" }
}

function mapApiToRow(
  item: Record<string, any>,
  index: number
): UtilizationLocationRow {
  return {
    id: String(item.id ?? `${item.location ?? "loc"}-${index}`),
    location: String(item.location ?? "—"),
    scheme: String(item.scheme ?? "—"),
    provider: String(item.provider ?? "—"),
    plan: String(item.plan ?? "—"),
    claimsCover: toNumber(item.claims_cover ?? 0),
    enrolleeCount: toNumber(item.number_of_enrolees ?? 0),
    approvedClaimsAmount: toNumber(item.approved_claims_amount ?? 0),
  }
}

/** Backend: data.state_statistics[] */
type LocationStateStat = {
  state: string
  provider_count: number
  enrolee_count: number
  total_utilization: number
}

/** What PerformanceByLocationCard expects */
type PerfLocationDatum = {
  id: string
  location: string
  providers: number
  enrollees: number
  utilization: number
}

export function UtilizationByLocationView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")
  const [page, setPage] = React.useState(1)

  // wire to ReportShell date pickers when ready
  const [startDate] = React.useState("")
  const [endDate] = React.useState("")

  const [filters, setFilters] = React.useState<LocationFilters>({
    service: "all",
    location: "all",
    scheme: "all",
    plan: "all",
    dateRange: "may-sep-2025",
    costRange: "all",
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

      // if backend supports these, pass them (else ignored)
      service: filters.service !== "all" ? filters.service : "",
      location: filters.location !== "all" ? filters.location : "",
      scheme: filters.scheme !== "all" ? filters.scheme : "",
      plan: filters.plan !== "all" ? filters.plan : "",
    }),
    [
      page,
      startDate,
      endDate,
      cost.min_cost,
      cost.max_cost,
      filters.service,
      filters.location,
      filters.scheme,
      filters.plan,
    ]
  )

  const utilQuery = useUtilizationByLocation(apiFilters as any)

  const pagination = utilQuery.data?.data?.pagination
  const summary = utilQuery.data?.data?.summary as
    | Partial<LocationSummary>
    | undefined

  const apiList = React.useMemo(() => {
    const list = utilQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : EMPTY_LIST
  }, [utilQuery.data?.data?.line_listing])

  const rows = React.useMemo<UtilizationLocationRow[]>(() => {
    if (!apiList.length) return EMPTY_ROWS

    let mapped = apiList.map((it, i) => mapApiToRow(it, i))

    // global search
    const s = q.trim().toLowerCase()
    if (s) {
      mapped = mapped.filter((r) =>
        `${r.location} ${r.scheme} ${r.provider} ${r.plan}`
          .toLowerCase()
          .includes(s)
      )
    }

    return mapped
  }, [apiList, q])

  // export (stable)
  const rowsRef = React.useRef<UtilizationLocationRow[] | null>(null)

  React.useEffect(() => {
    if (rowsRef.current === rows) return
    rowsRef.current = rows

    setConfig({
      fileName: "Utilization by Location",
      sheetName: "Utilization by Location",
      format: "xlsx",
      columns: [
        {
          header: "Location",
          value: (r: UtilizationLocationRow) => r.location,
        },
        { header: "Scheme", value: (r: UtilizationLocationRow) => r.scheme },
        {
          header: "Provider",
          value: (r: UtilizationLocationRow) => r.provider,
        },
        { header: "Plan", value: (r: UtilizationLocationRow) => r.plan },
        {
          header: "Claims Cover",
          value: (r: UtilizationLocationRow) => fmtNaira(r.claimsCover),
        },
        {
          header: "No. of Enrollees",
          value: (r: UtilizationLocationRow) => r.enrolleeCount,
        },
        {
          header: "Approved Claims Amount",
          value: (r: UtilizationLocationRow) =>
            fmtNaira(r.approvedClaimsAmount),
        },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  const chartData = React.useMemo(() => {
    const stats = utilQuery.data?.data?.state_statistics
    if (!Array.isArray(stats)) return []

    return stats.map((s, i) => ({
      id: `${s.state}-${i}`,
      location: s.state, // your card expects "location" label
      providers: toNumber(s.provider_count),
      enrollees: toNumber(s.enrolee_count),
      utilization: toNumber(s.total_utilization),
    }))
  }, [utilQuery.data?.data?.state_statistics])

  console.log(" utilQuery.data?.data?", utilQuery.data?.data)
  return (
    <div className="w-full">
      <LocationFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      <LocationStatsRow summary={summary} />

      <LocationTable
        rows={rows}
        page={pagination?.current_page ?? page}
        onPageChange={setPage}
        totalItems={pagination?.total ?? 0}
        pageSize={pagination?.per_page ?? PAGE_SIZE}
        loading={utilQuery.isLoading}
        error={
          utilQuery.isError ? (utilQuery.error as Error)?.message : undefined
        }
        fromLabel={"—"}
        toLabel={"—"}
      />

      <div className="px-6 py-6">
        <PerformanceByLocationCard
          data={chartData as any}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
