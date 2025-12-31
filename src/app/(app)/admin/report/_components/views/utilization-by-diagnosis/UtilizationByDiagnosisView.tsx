"use client"

import * as React from "react"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"
import { useUtilizationByDiagnosis } from "@/lib/api/reports"
import { UtilizationDiagnosisFiltersRow } from "./UtilizationDiagnosisFiltersRow"
import { UtilizationDiagnosisStatsRow } from "./UtilizationDiagnosisStatsRow"
import {
  UtilizationDiagnosisTable,
  type DiagnosisRow,
} from "./UtilizationDiagnosisTable"
import { DiagnosisLocationInsightsCard } from "./charts/DiagnosisLocationInsightsCard"

const PAGE_SIZE = 10
const EMPTY_LIST: any[] = []
const EMPTY_ROWS: DiagnosisRow[] = []

type Filters = {
  service: string
  location: string
  scheme: string
  plan: string
  dateRange: string
  costRange: string
}

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

/** tolerant mapper (update keys if your backend differs) */
function mapApiToDiagnosisRow(
  item: Record<string, any>,
  index: number
): DiagnosisRow {
  return {
    id: String(item.id ?? `${item.diagnosis ?? "diag"}-${index}`),

    diagnosis: String(
      item.diagnosis ?? item.diagnosis_name ?? item.name ?? "—"
    ),
    provider: String(
      item.provider ?? item.provider_name ?? item.hospital ?? "—"
    ),

    timesDiagnosed: toNumber(
      item.times_diagnosed ?? item.timesDiagnosed ?? item.count ?? 0
    ),
    enrolleeCount: toNumber(
      item.enrollee_count ?? item.enrolleeCount ?? item.enrollees_involved ?? 0
    ),

    cost: toNumber(item.total_cost ?? item.cost ?? item.amount ?? 0),

    service: String(item.service ?? item.service_name ?? ""),
    location: String(item.location ?? item.state ?? item.lga ?? ""),
    scheme: String(item.scheme ?? item.scheme_name ?? ""),
    plan: String(item.plan ?? item.plan_name ?? ""),
  }
}

export function UtilizationByDiagnosisView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")
  const [page, setPage] = React.useState(1)

  // wire to shell date pickers when available
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
      min_cost: cost.min_cost,
      max_cost: cost.max_cost,

      // include if backend supports; safe if ignored
      service: filters.service ?? "",
      location: filters.location ?? "",
      scheme: filters.scheme ?? "",
      plan: filters.plan ?? "",
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

  const diagQuery = useUtilizationByDiagnosis(apiFilters)

  const pagination = diagQuery.data?.data?.pagination
  const summary = diagQuery.data?.data?.summary

  const apiList = React.useMemo(() => {
    const list = diagQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : EMPTY_LIST
  }, [diagQuery.data?.data?.line_listing])

  const rows = React.useMemo<DiagnosisRow[]>(() => {
    if (!apiList.length) return EMPTY_ROWS

    let mapped = apiList.map((it, i) => mapApiToDiagnosisRow(it, i))

    // search
    const s = q.trim().toLowerCase()
    if (s) {
      mapped = mapped.filter((r) =>
        String(r.diagnosis ?? "")
          .toLowerCase()
          .includes(s)
      )
    }

    // keep local UI filters too (in case backend ignores them)
    if (filters.service)
      mapped = mapped.filter((r) => (r.service ?? "") === filters.service)
    if (filters.location)
      mapped = mapped.filter((r) => (r.location ?? "") === filters.location)
    if (filters.scheme)
      mapped = mapped.filter((r) => (r.scheme ?? "") === filters.scheme)
    if (filters.plan)
      mapped = mapped.filter((r) => (r.plan ?? "") === filters.plan)

    return mapped
  }, [apiList, q, filters])

  // export wiring (prevent loops)
  const rowsRef = React.useRef<DiagnosisRow[] | null>(null)
  React.useEffect(() => {
    if (rowsRef.current === rows) return
    rowsRef.current = rows

    setConfig({
      fileName: "Utilization by Diagnosis",
      sheetName: "Utilization by Diagnosis",
      format: "xlsx",
      columns: [
        { header: "Diagnosis", value: (r: DiagnosisRow) => r.diagnosis },
        { header: "Provider", value: (r: DiagnosisRow) => r.provider },
        {
          header: "Times Diagnosed",
          value: (r: DiagnosisRow) => r.timesDiagnosed,
        },
        {
          header: "Enrollees Involved",
          value: (r: DiagnosisRow) => r.enrolleeCount,
        },
        { header: "Total Cost", value: (r: DiagnosisRow) => fmtNaira(r.cost) },
        { header: "Service", value: (r: DiagnosisRow) => r.service ?? "" },
        { header: "Location", value: (r: DiagnosisRow) => r.location ?? "" },
        { header: "Scheme", value: (r: DiagnosisRow) => r.scheme ?? "" },
        { header: "Plan", value: (r: DiagnosisRow) => r.plan ?? "" },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  const fromLabel = startDate
    ? new Date(startDate).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : "—"
  const toLabel = endDate
    ? new Date(endDate).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : "—"

  return (
    <div className="w-full">
      <UtilizationDiagnosisFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      <UtilizationDiagnosisStatsRow rows={rows} summary={summary as any} />

      <UtilizationDiagnosisTable
        rows={rows}
        page={pagination?.current_page ?? page}
        onPageChange={setPage}
        totalItems={pagination?.total ?? 0}
        pageSize={pagination?.per_page ?? PAGE_SIZE}
        loading={diagQuery.isLoading}
        error={
          diagQuery.isError ? (diagQuery.error as Error)?.message : undefined
        }
        fromLabel={fromLabel}
        toLabel={toLabel}
      />

      <div className="px-6 py-6">
        <DiagnosisLocationInsightsCard
          title="Diagnosis Stats per location"
          range={range}
          onRangeChange={setRange}
          locationLabel="Search location - All"
          topTitle="Top Diagnosis in"
          monthlyTitle="Monthly Cost in"
          top={[]}
          monthly={[]}
        />
      </div>
    </div>
  )
}
