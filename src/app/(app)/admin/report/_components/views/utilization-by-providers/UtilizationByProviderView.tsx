"use client"

import * as React from "react"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { useReportExport } from "../../reports/ReportExportContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"

import { ProviderFiltersRow, type ProviderFilters } from "./ProviderFiltersRow"
import { ProviderStatsRow } from "./ProviderStatsRow"
import { ProviderTable } from "./ProviderTable"
import { RequestsChartCard } from "./RequestsChartCard"
import { ServicesOfferedByProvidersCard } from "./ServicesOfferedByProvidersCard"
import { Top7ProvidersByCostCard } from "./Top7ProvidersByCostCard"

import {
  useUtilizationByProvider,
  type UtilizationByProviderSummary,
  type UtilizationByProviderListItem,
} from "@/lib/api/reports"

import type { UtilProviderRow } from "./mock"

const PAGE_SIZE = 10
const EMPTY_LIST: UtilizationByProviderListItem[] = []
const EMPTY_ROWS: UtilProviderRow[] = []

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
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
  return { min_cost: "", max_cost: "" }
}

function mapApiToUtilProviderRow(
  item: UtilizationByProviderListItem,
  index: number
): UtilProviderRow {
  return {
    id: `${item.provider_name ?? "provider"}-${index}`,
    providerName: item.provider_name ?? "—",
    providerCode: (item as any).provider_code ?? "—", // if backend adds later
    locationLabel: item.location ?? "—",
    patientsCount: Number(item.patient_count ?? 0),
    requests: Number(item.number_of_requests ?? 0),
    totalCost: Number(item.total_cost ?? 0),
    avgCostPerEnrollee: Number(item.average_cost_per_enrollee ?? 0),
    avatarUrl: (item as any).logo_url ?? "",
  } as UtilProviderRow
}

function toPercent(x: number) {
  if (!Number.isFinite(x)) return 0
  return Math.round(x)
}

const PIE_COLORS = [
  "#1671D9",
  "#AAB511",
  "#D5314D",
  "#7A5AF8",
  "#12B76A",
  "#F79009",
  "#F04438",
  "#EAEAEA", // Others
]

export function UtilizationByProviderView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [range, setRange] = React.useState<RangeKey>("month")
  const [page, setPage] = React.useState(1)

  const [startDate] = React.useState("")
  const [endDate] = React.useState("")

  const [filters, setFilters] = React.useState<ProviderFilters>({
    location: "__all__",
    scheme: "__all__",
    plan: "__all__",
    dateRange: "__all__",
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
      location: filters.location !== "__all__" ? filters.location : "",
      scheme: filters.scheme !== "__all__" ? filters.scheme : "",
      plan: filters.plan !== "__all__" ? filters.plan : "",
    }),
    [
      page,
      startDate,
      endDate,
      cost.min_cost,
      cost.max_cost,
      filters.location,
      filters.scheme,
      filters.plan,
    ]
  )

  const utilQuery = useUtilizationByProvider(apiFilters as any)

  const pagination = utilQuery.data?.data?.pagination
  const summary = utilQuery.data?.data?.summary as
    | UtilizationByProviderSummary
    | undefined

  const apiList = React.useMemo(() => {
    const list = utilQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : EMPTY_LIST
  }, [utilQuery.data?.data?.line_listing])

  const rows = React.useMemo<UtilProviderRow[]>(() => {
    if (!apiList.length) return EMPTY_ROWS

    let mapped = apiList.map((it, i) => mapApiToUtilProviderRow(it, i))

    const s = q.trim().toLowerCase()
    if (s) {
      mapped = mapped.filter(
        (r) =>
          r.providerName?.toLowerCase().includes(s) ||
          r.providerCode?.toLowerCase().includes(s)
      )
    }

    if (filters.location !== "__all__") {
      mapped = mapped.filter(
        (r) => (r.locationLabel ?? "").toLowerCase() === filters.location
      )
    }

    return mapped
  }, [apiList, q, filters.location])

  // EXPORT CONFIG
  React.useEffect(() => {
    setConfig({
      fileName: "Utilization by Provider",
      sheetName: "Utilization by Provider",
      format: "xlsx",
      columns: [
        { header: "Provider", value: (r: UtilProviderRow) => r.providerName },
        {
          header: "Provider Code",
          value: (r: UtilProviderRow) => r.providerCode,
        },
        { header: "Location", value: (r: UtilProviderRow) => r.locationLabel },
        {
          header: "Patients Count",
          value: (r: UtilProviderRow) => r.patientsCount,
        },
        { header: "Requests", value: (r: UtilProviderRow) => r.requests },
        {
          header: "Total Cost",
          value: (r: UtilProviderRow) => fmtNaira(r.totalCost),
        },
        {
          header: "Avg. cost / Enrollee",
          value: (r: UtilProviderRow) => fmtNaira(r.avgCostPerEnrollee),
        },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  // ============================
  // REAL DATA MAPPERS (BACKEND)
  // ============================

  // A) RequestsChartCard from monthly_statistics
  const requestsSeries = React.useMemo(() => {
    const monthly = (utilQuery.data?.data as any)?.monthly_statistics
    if (!Array.isArray(monthly)) return []
    return monthly.map((m: any, i: number) => ({
      m: String(m.month_name ?? m.month ?? `M${i + 1}`),
      requests: Number(m.request_count ?? 0),
    }))
  }, [utilQuery.data?.data])
  console.log("montly", requestsSeries)
  // B) Top7ProvidersByCostCard from top_providers
  const top7Providers = React.useMemo(() => {
    const tops = (utilQuery.data?.data as any)?.top_providers
    if (!Array.isArray(tops)) return []

    const total =
      tops.reduce(
        (acc: number, t: any) => acc + Number(t.total_claims ?? 0),
        0
      ) || 1

    return tops.slice(0, 7).map((t: any, i: number) => {
      const amount = Number(t.total_claims ?? 0)
      const percent = toPercent((amount / total) * 100)

      const name = String(t.provider_name ?? "—")
      const isOthers = name.toLowerCase() === "others"

      return {
        id: `${name}-${i}`,
        label: name,
        code: String(t.provider_code ?? "—"),
        amount: fmtNaira(amount),
        percent,
        color: isOthers ? "#EAEAEA" : PIE_COLORS[i] ?? "#EAEAEA",
        logoUrl: String(t.logo_url ?? ""),
      }
    })
  }, [utilQuery.data?.data])

  // C) ServicesOfferedByProvidersCard
  // NOTE: backend does NOT provide "services offered count" yet.
  // If backend later adds "services_count" in line_listing, we will use it automatically.
  const servicesBars = React.useMemo(() => {
    if (!rows.length) return []
    return rows.map((r, i) => ({
      id: `${r.providerName}-${i}`,
      provider: r.providerName,
      value: Number((r as any).servicesCount ?? (r as any).services_count ?? 0),
    }))
  }, [rows])

  return (
    <div className="w-full">
      <ProviderFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      <ProviderStatsRow rows={rows} summary={summary} />

      <ProviderTable
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
        <RequestsChartCard
          data={requestsSeries as any}
          range={range}
          onRangeChange={setRange}
        />

        <ServicesOfferedByProvidersCard
          data={servicesBars as any}
          range={range}
          onRangeChange={setRange}
        />

        <Top7ProvidersByCostCard
          data={top7Providers as any}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    </div>
  )
}
