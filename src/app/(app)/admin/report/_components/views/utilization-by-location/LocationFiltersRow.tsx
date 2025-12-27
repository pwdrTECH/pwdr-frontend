// src/app/(app)/admin/report/_components/views/utilization-by-location/LocationFiltersRow.tsx
"use client"

import * as React from "react"
import { PillSelect } from "../../PillSelect"

export type LocationFilters = {
  service: string
  location: string
  scheme: string
  plan: string
  dateRange: string
  costRange: string
}

type Props = {
  value?: Partial<LocationFilters>
  onChange?: (next: LocationFilters) => void
}

const SERVICE_OPTIONS = [
  { label: "Service", value: "all" },
  { label: "Inpatient", value: "inpatient" },
  { label: "Outpatient", value: "outpatient" },
  { label: "Labs", value: "labs" },
  { label: "Pharmacy", value: "pharmacy" },
]

const LOCATION_OPTIONS = [
  { label: "Location", value: "all" },
  { label: "Abuja", value: "abuja" },
  { label: "Abia", value: "abia" },
  { label: "Anambra", value: "anambra" },
  { label: "Adamawa", value: "adamawa" },
  { label: "Akwa Ibom", value: "akwa-ibom" },
  { label: "Bauchi", value: "bauchi" },
  { label: "Lagos", value: "lagos" },
  { label: "Rivers", value: "rivers" },
  { label: "Kano", value: "kano" },
  { label: "Kaduna", value: "kaduna" },
]

const SCHEME_OPTIONS = [
  { label: "Schemes", value: "all" },
  { label: "NHIS", value: "nhis" },
  { label: "PHIS", value: "phis" },
  { label: "TSHIP", value: "tship" },
  { label: "NYSC", value: "nysc" },
]

const PLAN_OPTIONS = [
  { label: "Plan", value: "all" },
  { label: "Platinum", value: "platinum" },
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
]

const DATE_RANGE_OPTIONS = [
  { label: "Date Range", value: "may-sep-2025" },
  { label: "May, 2025 - Sep, 2025", value: "may-sep-2025" },
  { label: "Jan, 2025 - Jun, 2025", value: "jan-jun-2025" },
  { label: "All time", value: "all" },
]

const COST_RANGE_OPTIONS = [
  { label: "Cost Range", value: "all" },
  { label: "₦0 - ₦100,000", value: "0-100k" },
  { label: "₦100,000 - ₦500,000", value: "100k-500k" },
  { label: "₦500,000 - ₦1,000,000", value: "500k-1m" },
  { label: "₦1,000,000+", value: "1m+" },
]

export function LocationFiltersRow({ value, onChange }: Props) {
  const [filters, setFilters] = React.useState<LocationFilters>({
    service: value?.service ?? "all",
    location: value?.location ?? "all",
    scheme: value?.scheme ?? "all",
    plan: value?.plan ?? "all",
    dateRange: value?.dateRange ?? "may-sep-2025",
    costRange: value?.costRange ?? "all",
  })

  function patch<K extends keyof LocationFilters>(k: K, v: LocationFilters[K]) {
    const next = { ...filters, [k]: v }
    setFilters(next)
    onChange?.(next)
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
