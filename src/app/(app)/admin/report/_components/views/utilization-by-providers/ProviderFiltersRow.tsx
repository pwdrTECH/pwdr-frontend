"use client"

import * as React from "react"
import { PillSelect } from "../../PillSelect"

export type ProviderFilters = {
  location: string
  scheme: string
  plan: string
  dateRange: string
  costRange: string
}

type Props = {
  value?: Partial<ProviderFilters>
  onChange?: (next: ProviderFilters) => void
}

const LOCATION_OPTIONS = [
  { label: "Location", value: "__all__" },
  { label: "Abuja", value: "abuja" },
  { label: "Lagos", value: "lagos" },
  { label: "Kano", value: "kano" },
  { label: "Rivers", value: "rivers" },
]

const SCHEME_OPTIONS = [
  { label: "Schemes", value: "__all__" },
  { label: "NHIS", value: "nhis" },
  { label: "PHIS", value: "phis" },
  { label: "TSHIP", value: "tship" },
  { label: "NYSC", value: "nysc" },
]

const PLAN_OPTIONS = [
  { label: "Plan", value: "__all__" },
  { label: "Platinum", value: "platinum" },
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
]

const DATE_RANGE_OPTIONS = [
  { label: "Date Range", value: "__all__" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This year", value: "ytd" },
]

const COST_RANGE_OPTIONS = [
  { label: "Cost Range", value: "__all__" },
  { label: "₦0 - ₦100,000", value: "0-100k" },
  { label: "₦100,000 - ₦500,000", value: "100k-500k" },
  { label: "₦500,000 - ₦1,000,000", value: "500k-1m" },
  { label: "₦1,000,000+", value: "1m+" },
]

export function ProviderFiltersRow({ value, onChange }: Props) {
  const [filters, setFilters] = React.useState<ProviderFilters>({
    location: value?.location ?? "__all__",
    scheme: value?.scheme ?? "__all__",
    plan: value?.plan ?? "__all__",
    dateRange: value?.dateRange ?? "__all__",
    costRange: value?.costRange ?? "__all__",
  })

  function patch<K extends keyof ProviderFilters>(k: K, v: ProviderFilters[K]) {
    const next = { ...filters, [k]: v }
    setFilters(next)
    onChange?.(next)
  }

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-4 flex justify-end items-end">
      <div className="flex flex-wrap gap-4">
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
