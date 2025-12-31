"use client"

import * as React from "react"
import { PillSelect } from "../../PillSelect"

type Filters = {
  service: string
  location: string
  scheme: string
  plan: string
  dateRange: string
  costRange: string
}

type Props = {
  value: Filters
  onChange: (next: Filters) => void
}

const SERVICE_OPTIONS = [
  { label: "Inpatient", value: "inpatient" },
  { label: "Outpatient", value: "outpatient" },
  { label: "Labs", value: "labs" },
  { label: "Pharmacy", value: "pharmacy" },
]

const LOCATION_OPTIONS = [
  { label: "Abuja", value: "abuja" },
  { label: "Lagos", value: "lagos" },
  { label: "Kano", value: "kano" },
  { label: "Rivers", value: "rivers" },
]

const SCHEME_OPTIONS = [
  { label: "NHIS", value: "NHIS" },
  { label: "PHIS", value: "PHIS" },
  { label: "TSHIP", value: "TSHIP" },
  { label: "NYSC", value: "NYSC" },
]

const PLAN_OPTIONS = [
  { label: "Platinum", value: "platinum" },
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
]

const DATE_RANGE_OPTIONS = [
  { label: "May, 2025 - Sep, 2025", value: "may-sep-2025" },
  { label: "Jan, 2025 - Dec, 2025", value: "jan-dec-2025" },
]

const COST_RANGE_OPTIONS = [
  { label: "₦0 - ₦100,000", value: "0-100k" },
  { label: "₦100,000 - ₦500,000", value: "100k-500k" },
  { label: "₦500,000 - ₦1,000,000", value: "500k-1m" },
  { label: "₦1,000,000+", value: "1m+" },
]

function normalizeIncoming(value: Filters): Filters {
  return {
    service: value?.service ?? "",
    location: value?.location ?? "",
    scheme: value?.scheme ?? "",
    plan: value?.plan ?? "",
    dateRange: value?.dateRange ?? "",
    costRange: value?.costRange ?? "",
  }
}

export function UtilizationDiagnosisFiltersRow({ value, onChange }: Props) {
  const filters = React.useMemo(() => normalizeIncoming(value), [value])

  function patch<K extends keyof Filters>(k: K, v: Filters[K]) {
    onChange({ ...filters, [k]: v })
  }

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-4 flex justify-end items-end">
      <div className="flex flex-wrap gap-4">
        <PillSelect
          label="Service"
          value={filters.service}
          onChange={(v) => patch("service", v)}
          options={SERVICE_OPTIONS}
          placeholder="Service"
        />

        <PillSelect
          label="Location"
          value={filters.location}
          onChange={(v) => patch("location", v)}
          options={LOCATION_OPTIONS}
          placeholder="Location"
        />

        <PillSelect
          label="Schemes"
          value={filters.scheme}
          onChange={(v) => patch("scheme", v)}
          options={SCHEME_OPTIONS}
          placeholder="Schemes"
        />

        <PillSelect
          label="Plan"
          value={filters.plan}
          onChange={(v) => patch("plan", v)}
          options={PLAN_OPTIONS}
          placeholder="Plan"
        />

        <PillSelect
          label="Date Range"
          value={filters.dateRange}
          onChange={(v) => patch("dateRange", v)}
          options={DATE_RANGE_OPTIONS}
          placeholder="Date Range"
        />

        <PillSelect
          label="Cost Range"
          value={filters.costRange}
          onChange={(v) => patch("costRange", v)}
          options={COST_RANGE_OPTIONS}
          placeholder="Cost Range"
          className="w-[170px]"
        />
      </div>
    </div>
  )
}
