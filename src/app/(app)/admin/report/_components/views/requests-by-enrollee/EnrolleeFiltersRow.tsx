"use client"

import { LOCATION_OPTIONS } from "@/lib/data"
import * as React from "react"
import { PillSelect } from "../../PillSelect"

type Filters = {
  service: string
  location: string
  scheme: string
  plan: string
  costRange: string
}

type Props = {
  value?: Partial<Filters>
  onChange?: (next: Filters) => void
}

const SERVICE_OPTIONS = [
  { label: "Service", value: "" },
  { label: "Inpatient", value: "inpatient" },
  { label: "Outpatient", value: "outpatient" },
  { label: "Labs", value: "labs" },
  { label: "Pharmacy", value: "pharmacy" },
]

const SCHEME_OPTIONS = [
  { label: "Schemes", value: "" },
  { label: "NHIS", value: "nhis" },
  { label: "PHIS", value: "phis" },
  { label: "TSHIP", value: "tship" },
  { label: "NYSC", value: "nysc" },
]

const PLAN_OPTIONS = [
  { label: "Plan", value: "" },
  { label: "Platinum", value: "platinum" },
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
]

const COST_RANGE_OPTIONS = [
  { label: "Cost Range", value: "" },
  { label: "₦0 - ₦100,000", value: "0-100k" },
  { label: "₦100,000 - ₦500,000", value: "100k-500k" },
  { label: "₦500,000 - ₦1,000,000", value: "500k-1m" },
  { label: "₦1,000,000+", value: "1m+" },
]

export function EnrolleeFiltersRow({ value, onChange }: Props) {
  const [filters, setFilters] = React.useState<Filters>({
    service: value?.service ?? "",
    location: value?.location ?? "",
    scheme: value?.scheme ?? "",
    plan: value?.plan ?? "",
    costRange: value?.costRange ?? "",
  })

  function patch<K extends keyof Filters>(k: K, v: Filters[K]) {
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
