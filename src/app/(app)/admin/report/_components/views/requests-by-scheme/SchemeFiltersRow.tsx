"use client"

import * as React from "react"
import { PillSelect } from "../../PillSelect"

export type SchemeFilters = {
  service: string
  location: string
  scheme: string
  plan: string
  costRange: string
}

type Props = {
  value?: Partial<SchemeFilters>
  onChange?: (next: SchemeFilters) => void
}

const SERVICE_OPTIONS = [
  { label: "Service", value: "__all__" },
  { label: "Consultation", value: "consultation" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Labs", value: "labs" },
]

const LOCATION_OPTIONS = [
  { label: "Location", value: "__all__" },
  { label: "Abuja", value: "abuja" },
  { label: "Lagos", value: "lagos" },
  { label: "Kano", value: "kano" },
]

const SCHEME_OPTIONS = [
  { label: "Schemes", value: "__all__" },
  { label: "NHIS", value: "nhis" },
  { label: "TSHIP", value: "tship" },
  { label: "PHIS", value: "phis" },
]

const PLAN_OPTIONS = [
  { label: "Plan", value: "__all__" },
  { label: "Platinum Plan", value: "platinum" },
  { label: "Gold Plan", value: "gold" },
  { label: "Silver Plan", value: "silver" },
]

const COST_RANGE_OPTIONS = [
  { label: "Cost Range", value: "__all__" },
  { label: "₦0 - ₦100,000", value: "0-100k" },
  { label: "₦100,000 - ₦500,000", value: "100k-500k" },
  { label: "₦500,000+", value: "500k+" },
]

export function SchemeFiltersRow({ value, onChange }: Props) {
  const [filters, setFilters] = React.useState<SchemeFilters>({
    service: value?.service ?? "__all__",
    location: value?.location ?? "__all__",
    scheme: value?.scheme ?? "__all__",
    plan: value?.plan ?? "__all__",
    costRange: value?.costRange ?? "__all__",
  })

  function patch<K extends keyof SchemeFilters>(k: K, v: SchemeFilters[K]) {
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
