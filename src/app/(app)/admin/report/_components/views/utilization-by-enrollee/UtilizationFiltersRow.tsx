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
  value?: Partial<Filters>
  onChange?: (next: Filters) => void
}

const ALL = "__all"

const SERVICE_OPTIONS = [
  { label: "Service", value: ALL },
  { label: "Inpatient", value: "inpatient" },
  { label: "Outpatient", value: "outpatient" },
  { label: "Labs", value: "labs" },
  { label: "Pharmacy", value: "pharmacy" },
]

const LOCATION_OPTIONS = [
  { label: "Location", value: ALL },
  { label: "Abuja", value: "abuja" },
  { label: "Lagos", value: "lagos" },
  { label: "Kano", value: "kano" },
  { label: "Rivers", value: "rivers" },
]

const SCHEME_OPTIONS = [
  { label: "Schemes", value: ALL },
  { label: "NHIS", value: "NHIS" },
  { label: "PHIS", value: "PHIS" },
  { label: "TSHIP", value: "TSHIP" },
  { label: "NYSC", value: "NYSC" },
]

const PLAN_OPTIONS = [
  { label: "Plan", value: ALL },
  { label: "Platinum", value: "Platinum" },
  { label: "Gold", value: "Gold" },
  { label: "Silver", value: "Silver" },
]

const DATE_RANGE_OPTIONS = [
  { label: "Date Range", value: ALL },
  { label: "This month", value: "this-month" },
  { label: "Last month", value: "last-month" },
  { label: "Last 3 months", value: "last-3" },
  { label: "This year", value: "this-year" },
]

const COST_RANGE_OPTIONS = [
  { label: "Cost Range", value: ALL },
  { label: "₦0 - ₦100,000", value: "0-100k" },
  { label: "₦100,000 - ₦500,000", value: "100k-500k" },
  { label: "₦500,000 - ₦1,000,000", value: "500k-1m" },
  { label: "₦1,000,000+", value: "1m+" },
]

function toAllSafe(v: string) {
  return v === "" ? ALL : v
}
function fromAllSafe(v: string) {
  return v === ALL ? "" : v
}

export function UtilizationFiltersRow({ value, onChange }: Props) {
  const [filters, setFilters] = React.useState<Filters>({
    service: toAllSafe(value?.service ?? ""),
    location: toAllSafe(value?.location ?? ""),
    scheme: toAllSafe(value?.scheme ?? ""),
    plan: toAllSafe(value?.plan ?? ""),
    dateRange: toAllSafe(value?.dateRange ?? ""),
    costRange: toAllSafe(value?.costRange ?? ""),
  })

  function patch<K extends keyof Filters>(k: K, v: Filters[K]) {
    const next = { ...filters, [k]: v }
    setFilters(next)

    // emit normalized ("" means All)
    onChange?.({
      ...next,
      service: fromAllSafe(next.service),
      location: fromAllSafe(next.location),
      scheme: fromAllSafe(next.scheme),
      plan: fromAllSafe(next.plan),
      dateRange: fromAllSafe(next.dateRange),
      costRange: fromAllSafe(next.costRange),
    })
  }

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-4 flex justify-end items-end">
      <div className="flex flex-wrap gap-4">
        <PillSelect
          label="Service"
          value={filters.service}
          onChange={(v) => patch("service", v)}
          options={SERVICE_OPTIONS}
        />
        <PillSelect
          label="Location"
          value={filters.location}
          onChange={(v) => patch("location", v)}
          options={LOCATION_OPTIONS}
        />
        <PillSelect
          label="Schemes"
          value={filters.scheme}
          onChange={(v) => patch("scheme", v)}
          options={SCHEME_OPTIONS}
        />
        <PillSelect
          label="Plan"
          value={filters.plan}
          onChange={(v) => patch("plan", v)}
          options={PLAN_OPTIONS}
        />
        <PillSelect
          label="Date Range"
          value={filters.dateRange}
          onChange={(v) => patch("dateRange", v)}
          options={DATE_RANGE_OPTIONS}
          className="w-[170px]"
        />
        <PillSelect
          label="Cost Range"
          value={filters.costRange}
          onChange={(v) => patch("costRange", v)}
          options={COST_RANGE_OPTIONS}
          className="w-[170px]"
        />
      </div>
    </div>
  )
}
