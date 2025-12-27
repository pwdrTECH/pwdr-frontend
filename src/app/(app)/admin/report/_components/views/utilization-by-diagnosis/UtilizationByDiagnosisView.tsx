"use client"

import * as React from "react"
import { useReportExport } from "../../reports/ReportExportContext"
import { useReportQuery } from "../../reports/ReportQueryContext"
import type { RangeKey } from "../requests-by-provider/StatusRangePills"

import { UtilizationDiagnosisFiltersRow } from "./UtilizationDiagnosisFiltersRow"
import { UtilizationDiagnosisStatsRow } from "./UtilizationDiagnosisStatsRow"
import {
  UtilizationDiagnosisTable,
  type DiagnosisRow,
} from "./UtilizationDiagnosisTable"
import { DiagnosisLocationInsightsCard } from "./charts/DiagnosisLocationInsightsCard"
import {
  MOCK_DIAGNOSIS_MONTHLY,
  MOCK_DIAGNOSIS_ROWS,
  MOCK_DIAGNOSIS_TOP,
} from "./mock"

type Filters = {
  service: string
  location: string
  scheme: string
  plan: string
  dateRange: string
  costRange: string
}

function inCostRange(amount: number, range: string) {
  if (!range || !amount) return true
  if (range === "0-100k") return amount <= 100_000
  if (range === "100k-500k") return amount > 100_000 && amount <= 500_000
  if (range === "500k-1m") return amount > 500_000 && amount <= 1_000_000
  if (range === "1m+") return amount > 1_000_000
  return true
}

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function UtilizationByDiagnosisView() {
  const { q } = useReportQuery()
  const { setConfig } = useReportExport()
  const [range, setRange] = React.useState<RangeKey>("month")

  const [filters, setFilters] = React.useState<Filters>({
    service: "",
    location: "",
    scheme: "",
    plan: "",
    dateRange: "",
    costRange: "",
  })

  const rows = React.useMemo(() => {
    let filtered = MOCK_DIAGNOSIS_ROWS as DiagnosisRow[]

    // search
    const s = q.trim().toLowerCase()
    if (s) {
      filtered = filtered.filter((r) => r.diagnosis.toLowerCase().includes(s))
    }

    if (filters.service) {
      filtered = filtered.filter((r) => r.service === filters.service)
    }
    if (filters.location) {
      filtered = filtered.filter((r) => r.location === filters.location)
    }
    if (filters.scheme) {
      filtered = filtered.filter((r) => r.scheme === filters.scheme)
    }
    if (filters.plan) {
      filtered = filtered.filter((r) => r.plan === filters.plan)
    }
    if (filters.costRange) {
      filtered = filtered.filter((r) =>
        inCostRange(Number(r.cost ?? 0), filters.costRange)
      )
    }

    // dateRange is UI-only for now

    return filtered
  }, [q, filters])

  // EXPORT CONFIG
  React.useEffect(() => {
    setConfig({
      fileName: "Utilization by Diagnosis",
      sheetName: "Utilization by Diagnosis",
      format: "xlsx", // or "csv"
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
        {
          header: "Total Cost",
          value: (r: DiagnosisRow) => fmtNaira(r.cost),
        },
        { header: "Service", value: (r: DiagnosisRow) => r.service ?? "" },
        { header: "Location", value: (r: DiagnosisRow) => r.location ?? "" },
        { header: "Scheme", value: (r: DiagnosisRow) => r.scheme ?? "" },
        { header: "Plan", value: (r: DiagnosisRow) => r.plan ?? "" },
      ],
      rows: () => rows,
    })

    return () => setConfig(null)
  }, [rows, setConfig])

  return (
    <div className="w-full">
      <UtilizationDiagnosisFiltersRow value={filters} onChange={setFilters} />
      <UtilizationDiagnosisStatsRow rows={rows} />
      <UtilizationDiagnosisTable rows={rows} />

      <div className="px-6 py-6">
        <DiagnosisLocationInsightsCard
          title="Diagnosis Stats per location"
          range={range}
          onRangeChange={setRange}
          locationLabel="Search location - All"
          topTitle="Top Diagnosis in"
          monthlyTitle="Monthly Cost in"
          top={MOCK_DIAGNOSIS_TOP}
          monthly={MOCK_DIAGNOSIS_MONTHLY}
        />
      </div>
    </div>
  )
}
