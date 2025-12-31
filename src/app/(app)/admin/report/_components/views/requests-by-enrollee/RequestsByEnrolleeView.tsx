"use client"

import { useEnroleeRequests } from "@/lib/api/reports"
import { useEffect, useMemo, useRef, useState } from "react"
import { ClaimsComparisonCard } from "../../reports/chart/ClaimsComparisonCard"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import { EnrolleeFiltersRow } from "./EnrolleeFiltersRow"
import { EnrolleeStatsRow } from "./EnrolleeStatsRow"
import { EnrolleeTable } from "./EnrolleeTable"
import { StatusComparisonCard } from "./StatusComparisonCard"
import type { EnrolleeRow } from "./types"

const PAGE_SIZE = 10
const EMPTY_LIST: any[] = []
const EMPTY_ROWS: EnrolleeRow[] = []

type Filters = {
  service: string
  location: string
  scheme: string
  plan: string
  costRange: string
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

function formatMonthYear(dateStr?: string) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
}

function mapApiToEnrolleeRow(
  item: Record<string, any>,
  index: number
): EnrolleeRow {
  const enrolleeName = String(
    item.enrolee_name ??
      item.enrollee_name ??
      item.patient_name ??
      item.full_name ??
      ""
  )
  const enrolleeId = String(
    item.enrolee_id ?? item.enrollee_id ?? item.patient_id ?? ""
  )
  const provider = String(
    item.provider_name ?? item.provider ?? item.hospital ?? ""
  )
  const plan = String(item.plan ?? item.plan_name ?? item.plan_id ?? "")
  const scheme = String(item.scheme ?? item.scheme_name ?? item.scheme_id ?? "")
  const status = String(item.status ?? item.request_status ?? "")

  const rawAmount =
    item.amount_claimed ?? item.amount ?? item.total_cost ?? item.cost
  const amountNumber =
    typeof rawAmount === "number"
      ? rawAmount
      : Number(String(rawAmount ?? "0").replace(/,/g, "")) || 0

  const requestDate = String(
    item.request_date ?? item.date ?? item.created_at ?? ""
  )
  const requestTime = String(item.request_time ?? item.time ?? "")

  const service = item.service ?? item.service_name ?? ""
  const location = item.location ?? item.lga ?? item.state ?? ""

  return {
    id: String(item.id ?? item.request_id ?? `${enrolleeId}-${index}`),
    enrolleeName,
    enrolleeId,
    provider,
    plan,
    scheme,
    status,
    amount: rawAmount != null ? String(rawAmount) : "",
    amountClaimedNumber: amountNumber,
    requestDate,
    requestTime,
    service,
    location,
    _raw: item,
  } as unknown as EnrolleeRow
}

export function RequestsByEnrolleeView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()

  const [startDate] = useState<string>("")
  const [endDate] = useState<string>("")

  const [filters, setFilters] = useState<Filters>({
    service: "",
    location: "",
    scheme: "",
    plan: "",
    costRange: "",
  })

  const [page, setPage] = useState(1)

  const cost = useMemo(
    () => parseCostRange(filters.costRange),
    [filters.costRange]
  )

  const apiFilters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      enrolee_id: "",
      id: "",
      scheme_id: "",
      scheme: filters.scheme ?? "",
      plan_id: "",
      plan: filters.plan ?? "",
      min_cost: cost.min_cost,
      max_cost: cost.max_cost,
      start_date: startDate,
      end_date: endDate,
    }),
    [
      page,
      filters.scheme,
      filters.plan,
      cost.min_cost,
      cost.max_cost,
      startDate,
      endDate,
    ]
  )

  const reqQuery = useEnroleeRequests(apiFilters)

  const summary = reqQuery.data?.data?.summary
  const pagination = reqQuery.data?.data?.pagination

  const apiList = useMemo(() => {
    const list = reqQuery.data?.data?.line_listing
    return Array.isArray(list) ? list : EMPTY_LIST
  }, [reqQuery.data?.data?.line_listing])

  const rows = useMemo(() => {
    if (!apiList.length) return EMPTY_ROWS

    let mapped = apiList.map((it, i) => mapApiToEnrolleeRow(it, i))

    const s = q.trim().toLowerCase()
    if (s) {
      mapped = mapped.filter((r: any) => {
        const name = String(r.enrolleeName ?? "").toLowerCase()
        const id = String(r.enrolleeId ?? "").toLowerCase()
        const prov = String(r.provider ?? "").toLowerCase()
        return name.includes(s) || id.includes(s) || prov.includes(s)
      })
    }

    if (filters.service)
      mapped = mapped.filter(
        (r: any) => String(r.service ?? "") === filters.service
      )
    if (filters.location)
      mapped = mapped.filter(
        (r: any) => String(r.location ?? "") === filters.location
      )

    if (filters.scheme)
      mapped = mapped.filter(
        (r: any) => String(r.scheme ?? "") === filters.scheme
      )
    if (filters.plan)
      mapped = mapped.filter((r: any) => String(r.plan ?? "") === filters.plan)

    return mapped as EnrolleeRow[]
  }, [apiList, q, filters])

  const series = useMemo(() => [], [])

  /**
   * ✅ Export config without infinite loop:
   * - Don’t rebuild config from scratch every render
   * - Only call setConfig when rows reference changes meaningfully
   */
  const rowsRef = useRef<EnrolleeRow[] | null>(null)

  useEffect(() => {
    // prevents repetitive setConfig calls when rows is the same reference
    if (rowsRef.current === rows) return
    rowsRef.current = rows

    setConfig({
      fileName: "Requests by Enrollee",
      sheetName: "Requests by Enrollee",
      format: "xlsx",
      columns: [
        {
          header: "Enrollee",
          value: (r: EnrolleeRow) => (r as any).enrolleeName,
        },
        {
          header: "Enrollee ID",
          value: (r: EnrolleeRow) => (r as any).enrolleeId,
        },
        { header: "Plan", value: (r: EnrolleeRow) => (r as any).plan ?? "" },
        {
          header: "Scheme",
          value: (r: EnrolleeRow) => (r as any).scheme ?? "",
        },
        {
          header: "Provider",
          value: (r: EnrolleeRow) => (r as any).provider ?? "",
        },
        {
          header: "Request Date",
          value: (r: EnrolleeRow) => (r as any).requestDate ?? "",
        },
        {
          header: "Request Time",
          value: (r: EnrolleeRow) => (r as any).requestTime ?? "",
        },
        {
          header: "Status",
          value: (r: EnrolleeRow) => (r as any).status ?? "",
        },
        {
          header: "Amount Claimed",
          value: (r: EnrolleeRow) => (r as any).amount ?? "",
        },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <EnrolleeFiltersRow
        value={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
      />

      <EnrolleeStatsRow summary={summary} />

      <EnrolleeTable
        rows={rows}
        page={pagination?.current_page ?? page}
        onPageChange={setPage}
        totalItems={pagination?.total ?? 0}
        pageSize={pagination?.per_page ?? PAGE_SIZE}
        fromLabel={formatMonthYear(startDate)}
        toLabel={formatMonthYear(endDate)}
      />

      <div className="px-6 py-6 space-y-10.5">
        <ClaimsComparisonCard data={series as any} />
        <StatusComparisonCard
          summary={{
            approved_amount: summary?.total_approved_claims_amount ?? 0,
            rejected_amount: summary?.rejected_claims_amount ?? 0,
            pending_amount: summary?.pending_claims_amount ?? 0,
            total_amount: summary?.total_claims_amount ?? 0,
            total_count: summary?.total_requests_count ?? 0,
          }}
        />
      </div>
    </div>
  )
}
