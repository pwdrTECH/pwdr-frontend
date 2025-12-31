"use client"

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
  { label: "Service", value: "__all__" },
  { label: "Inpatient", value: "inpatient" },
  { label: "Outpatient", value: "outpatient" },
  { label: "Labs", value: "labs" },
  { label: "Pharmacy", value: "pharmacy" },
]

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

const COST_RANGE_OPTIONS = [
  { label: "Cost Range", value: "__all__" },
  { label: "₦0 - ₦100,000", value: "0-100k" },
  { label: "₦100,000 - ₦500,000", value: "100k-500k" },
  { label: "₦500,000 - ₦1,000,000", value: "500k-1m" },
  { label: "₦1,000,000+", value: "1m+" },
]

export type OrgFilters = Filters

export function OrganizationFiltersRow({ value, onChange }: Props) {
  const [filters, setFilters] = React.useState<Filters>({
    service: value?.service ?? "__all__",
    location: value?.location ?? "__all__",
    scheme: value?.scheme ?? "__all__",
    plan: value?.plan ?? "__all__",
    costRange: value?.costRange ?? "__all__",
  })

  // ✅ keep local state in sync if parent updates `value` (no biomelint deps issues)
  React.useEffect(() => {
    if (!value) return
    setFilters((prev) => ({
      ...prev,
      service: value.service ?? prev.service,
      location: value.location ?? prev.location,
      scheme: value.scheme ?? prev.scheme,
      plan: value.plan ?? prev.plan,
      costRange: value.costRange ?? prev.costRange,
    }))
  }, [value])

  function patch<K extends keyof Filters>(k: K, v: Filters[K]) {
    setFilters((prev) => {
      const next = { ...prev, [k]: v }
      onChange?.(next)
      return next
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
