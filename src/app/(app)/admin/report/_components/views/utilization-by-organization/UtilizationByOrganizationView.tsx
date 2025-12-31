"use client"

import * as React from "react"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"

import {
  OrganizationFiltersRow,
  type OrgFilters,
} from "./OrganizationFiltersRow"
import { OrganizationStatsRow } from "./OrganizationStatsRow"
import { OrganizationTable } from "./OrganizationTable"
import { Top7OrganizationsByUtilizationCard } from "./Top7OrganizationsByUtilizationCard"
import { ClaimsComparisonCard } from "../../reports/chart/ClaimsComparisonCard"
import { useUtilizationByOrganization } from "@/lib/api/reports"
import type { OrgRow } from "./mock"

const PAGE_SIZE = 10
const EMPTY_LIST: any[] = []
const EMPTY_ROWS: OrgRow[] = []

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function toNumber(x: any) {
  if (typeof x === "number") return x
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function safeDiv(n: number, d: number) {
  return d > 0 ? n / d : 0
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
  if (costRange.endsWith("+"))
    return { min_cost: costRange.replace("+", ""), max_cost: "" }
  const [min, max] = costRange.split("-")
  return { min_cost: min ?? "", max_cost: max ?? "" }
}

function mapApiToOrgRow(item: Record<string, any>, index: number): OrgRow {
  const organization = String(
    item.organization ?? item.org_name ?? item.name ?? "—"
  )
  const scheme = String(item.scheme ?? item.scheme_name ?? "—")
  const plan = String(item.plan ?? item.plan_name ?? "—")
  const location = String(item.location ?? item.state ?? item.lga ?? "—")

  const requests = toNumber(
    item.requests ??
      item.total_requests ??
      item.total_requests_count ??
      item.totalRequests ??
      0
  )

  const approvedClaims = toNumber(
    item.approved_claims ?? item.approved_count ?? item.approvedClaims ?? 0
  )

  const deniedClaims = toNumber(
    item.denied_claims ?? item.denied_count ?? item.deniedClaims ?? 0
  )

  // total cost / claims cover style field
  const totalCost = toNumber(
    item.total_cost ??
      item.total_claims_amount ??
      item.claims_cover ??
      item.totalCost ??
      0
  )

  // utilization cost typically equals approved amount
  const utilizationCost = toNumber(
    item.utilization_cost ??
      item.approved_claims_amount ??
      item.approved_claims_value ??
      item.utilizationCost ??
      0
  )

  const enrolleeCount = toNumber(
    item.enrollee_count ??
      item.enrolleeCount ??
      item.number_of_enrolees ??
      item.enrollees ??
      0
  )

  const premiumPool = toNumber(
    item.premium_pool ?? item.total_premium ?? item.premiumPool ?? 0
  )

  const avgCostPerEnrollee = Math.round(safeDiv(utilizationCost, enrolleeCount))

  // NOTE:
  // If your OrgRow DOES NOT include any of the extra fields below,
  // remove them (TS will flag it).
  return {
    id: String(item.id ?? `${organization}-${index}`),

    organization,
    scheme,
    plan,
    location,
    enrolleeCount,
    requests,
    totalCost,
    avgCostPerEnrollee,
    premiumPool,
    totalRequests: requests,
    approvedClaims,
    deniedClaims,
    utilizationCost,
    service: String(item.service ?? item.service_name ?? ""),
    costRange: String(item.cost_range ?? item.costRange ?? ""),
  }
}

export function UtilizationByOrganizationView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")
  const [page, setPage] = React.useState(1)

  // wire to shell date pickers later
  const [startDate] = React.useState("")
  const [endDate] = React.useState("")

  const [filters, setFilters] = React.useState<OrgFilters>({
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

      // optional (safe if backend ignores)
      service: filters.service !== "__all__" ? filters.service : "",
      location: filters.location !== "__all__" ? filters.location : "",
      scheme: filters.scheme !== "__all__" ? filters.scheme : "",
      plan: filters.plan !== "__all__" ? filters.plan : "",
      cost_range: filters.costRange !== "__all__" ? filters.costRange : "",
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
      filters.costRange,
    ]
  )

  const utilQuery = useUtilizationByOrganization(apiFilters)

  const pagination = utilQuery.data?.data?.pagination
  const summary = utilQuery.data?.data?.summary

  const apiList = React.useMemo(() => {
    const list = utilQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : EMPTY_LIST
  }, [utilQuery.data?.data?.line_listing])

  const rows = React.useMemo<OrgRow[]>(() => {
    if (!apiList.length) return EMPTY_ROWS

    let mapped = apiList.map((it, i) => mapApiToOrgRow(it, i))

    // search
    const s = q.trim().toLowerCase()
    if (s) {
      mapped = mapped.filter((r) =>
        String(r.organization ?? "")
          .toLowerCase()
          .includes(s)
      )
    }

    // keep UI-side filters too (in case backend ignores)
    if (filters.service !== "__all__") {
      mapped = mapped.filter((r: any) => r.service === filters.service)
    }
    if (filters.location !== "__all__") {
      mapped = mapped.filter((r) => r.location === filters.location)
    }
    if (filters.scheme !== "__all__") {
      mapped = mapped.filter((r) => r.scheme === filters.scheme)
    }
    if (filters.plan !== "__all__") {
      mapped = mapped.filter((r) => r.plan === filters.plan)
    }
    if (filters.costRange !== "__all__") {
      mapped = mapped.filter((r: any) => r.costRange === filters.costRange)
    }

    return mapped
  }, [
    apiList,
    q,
    filters.service,
    filters.location,
    filters.scheme,
    filters.plan,
    filters.costRange,
  ])

  // EXPORT CONFIG (current filtered page data)
  const rowsRef = React.useRef<OrgRow[] | null>(null)
  React.useEffect(() => {
    if (rowsRef.current === rows) return
    rowsRef.current = rows

    setConfig({
      fileName: "Utilization by Organization",
      sheetName: "Utilization by Organization",
      format: "xlsx",
      columns: [
        { header: "Organization", value: (r: any) => r.organization },
        { header: "Scheme", value: (r: any) => r.scheme },
        { header: "Plan", value: (r: any) => r.plan },
        { header: "Location", value: (r: any) => r.location },
        { header: "Enrollee Count", value: (r: any) => r.enrolleeCount },
        { header: "Requests", value: (r: any) => r.requests },
        { header: "Total Cost", value: (r: any) => fmtNaira(r.totalCost) },
        {
          header: "Avg Cost / Enrollee",
          value: (r: any) => fmtNaira(r.avgCostPerEnrollee),
        },
        { header: "Premium Pool", value: (r: any) => fmtNaira(r.premiumPool) },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  // charts: remove mock usage (until backend provides chart payloads)
  const claimsSeries = React.useMemo(() => [], [])
  const top7 = React.useMemo(() => [], [])

  return (
    <div className="w-full">
      <OrganizationFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      <OrganizationStatsRow rows={rows} summary={summary as any} />

      <OrganizationTable
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

      <div className="px-6 py-6 space-y-6">
        <ClaimsComparisonCard data={claimsSeries as any} curveType="linear" />

        <Top7OrganizationsByUtilizationCard
          data={top7 as any}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
