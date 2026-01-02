"use client"

import * as React from "react"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"

import { SchemeFiltersRow, type SchemeFilters } from "./SchemeFiltersRow"
import { SchemeStatsRow } from "./SchemeStatsRow"
import { SchemeTable } from "./SchemeTable"
import { TopSchemesCard } from "./TopSchemesCard"

import { useUtilizationByScheme } from "@/lib/api/reports"
import type { UtilSchemeRow } from "./mock"

const PAGE_SIZE = 20
const EMPTY_LIST: any[] = []
const EMPTY_ROWS: UtilSchemeRow[] = []

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function toNumber(x: unknown) {
  if (typeof x === "number") return Number.isFinite(x) ? x : 0
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function parseCostRange(costRange: string): {
  min_cost: string
  max_cost: string
} {
  if (!costRange || costRange === "__all__")
    return { min_cost: "", max_cost: "" }
  if (costRange === "0-100k") return { min_cost: "0", max_cost: "100000" }
  if (costRange === "100k-500k")
    return { min_cost: "100001", max_cost: "500000" }
  if (costRange === "500k-1m")
    return { min_cost: "500001", max_cost: "1000000" }
  if (costRange === "1m+") return { min_cost: "1000001", max_cost: "" }
  if (costRange === "500k+") return { min_cost: "500000", max_cost: "" } // scheme screen uses 500k+
  return { min_cost: "", max_cost: "" }
}

/**
 * Mapper: matches your scheme payload:
 * - scheme
 * - plan
 * - enrolee_name
 * - total_requests
 * - total_cost
 * - average_cost_per_enrolee
 */
function mapApiToUtilSchemeRow(
  item: Record<string, any>,
  index: number
): UtilSchemeRow {
  return {
    id: String(item.id ?? `${item.scheme ?? "scheme"}-${index}`),
    schemeLabel: String(item.scheme ?? "—"),
    planLabel: String(item.plan ?? "—"),
    enrolleeName: String(item.enrolee_name ?? "—"),
    totalRequests: toNumber(item.total_requests ?? 0),
    totalCost: toNumber(item.total_cost ?? 0),
    avgCostPerEnrollee: toNumber(item.average_cost_per_enrolee ?? 0),

    // API doesn't provide per-row approval rate; keep dash for UI
    approvalRateLabel: "—",

    // optional: keep filter fields (useful if you later add them to payload)
    service: String(item.service ?? ""),
    location: String(item.location ?? ""),
    scheme: String(item.scheme ?? ""),
    plan: String(item.plan ?? ""),
    costRange: String(item.cost_range ?? ""),
  } as UtilSchemeRow
}

/**
 * Maps dropdown values to API-friendly values.
 * Your dropdown uses short codes (nhis/tship/phis/platinum/gold/silver),
 * while API rows show full names like "GIFSHIP" and "Premium Executive".
 * Adjust these maps as your backend finalizes.
 */
const SCHEME_VALUE_TO_LABEL: Record<string, string> = {
  nhis: "NHIS",
  tship: "TSHIP",
  phis: "PHIS",
  // add more as needed
}

const PLAN_VALUE_TO_LABEL: Record<string, string> = {
  platinum: "Platinum Plan",
  gold: "Gold Plan",
  silver: "Silver Plan",
  // add more as needed
}

function normalizeText(x: unknown) {
  return String(x ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

export function UtilizationBySchemeView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")
  const [page, setPage] = React.useState(1)

  const [startDate] = React.useState<string>("")
  const [endDate] = React.useState<string>("")

  const [filters, setFilters] = React.useState<SchemeFilters>({
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

  const reqQuery = useUtilizationByScheme(apiFilters as any)

  const pagination = reqQuery.data?.data?.pagination
  const summary = reqQuery.data?.data?.summary

  const apiList = React.useMemo(() => {
    const list = reqQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : EMPTY_LIST
  }, [reqQuery.data?.data?.line_listing])

  const rows = React.useMemo<UtilSchemeRow[]>(() => {
    if (!apiList.length) return EMPTY_ROWS

    let mapped = apiList.map((it, i) => mapApiToUtilSchemeRow(it, i))

    const s = normalizeText(q)
    if (s) {
      mapped = mapped.filter((r) => normalizeText(r.enrolleeName).includes(s))
    }

    if (filters.scheme !== "__all__") {
      const expected = normalizeText(
        SCHEME_VALUE_TO_LABEL[filters.scheme] ?? filters.scheme
      )
      mapped = mapped.filter((r) => normalizeText(r.schemeLabel) === expected)
    }

    if (filters.plan !== "__all__") {
      const expected = normalizeText(
        PLAN_VALUE_TO_LABEL[filters.plan] ?? filters.plan
      )
      mapped = mapped.filter((r) => normalizeText(r.planLabel) === expected)
    }

    return mapped
  }, [apiList, q, filters.scheme, filters.plan])

  React.useEffect(() => {
    setConfig({
      fileName: "Utilization by Scheme",
      sheetName: "Utilization by Scheme",
      format: "xlsx",
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

  // ✅ REAL backend → chart points
  const topSchemesSeries = React.useMemo(() => {
    const ms = (reqQuery.data?.data as any)?.monthly_statistics
    if (!Array.isArray(ms) || !ms.length) return []

    // Collect all scheme names across all months (so keys are stable)
    const allSchemes = new Set<string>()
    for (const monthRow of ms) {
      const schemes = Array.isArray(monthRow?.schemes) ? monthRow.schemes : []
      for (const s of schemes) allSchemes.add(String(s?.scheme ?? "").trim())
    }
    const schemeKeys = Array.from(allSchemes).filter(Boolean)

    // Month label helper: "December" -> "Dec"
    const shortMonth = (name: string) => String(name ?? "").slice(0, 3)

    // Build points: { m: "Dec", NHIS: 1, GIFSHIP: 1 }
    return ms.map((monthRow: any, idx: number) => {
      const point: any = {
        m: shortMonth(monthRow?.month_name ?? `M${idx + 1}`),
      }

      // init zeros for all scheme keys
      for (const k of schemeKeys) point[k] = 0

      const schemes = Array.isArray(monthRow?.schemes) ? monthRow.schemes : []
      for (const s of schemes) {
        const key = String(s?.scheme ?? "").trim()
        if (!key) continue
        point[key] = toNumber(s?.enrolee_count ?? 0)
      }

      return point
    })
  }, [reqQuery.data?.data])

  return (
    <div className="w-full">
      <SchemeFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      <SchemeStatsRow rows={rows as any} summary={summary as any} />

      <SchemeTable
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

      <div className="px-6 py-6">
        <TopSchemesCard
          data={topSchemesSeries as any}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
