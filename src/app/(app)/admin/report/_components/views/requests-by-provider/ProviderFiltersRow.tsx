"use client"

import * as React from "react"
import { PillSelect } from "../../PillSelect"

type Filters = {
  service: string
  location: string
}

type Props = {
  value?: Partial<Filters>
  onChange?: (next: Filters) => void
}

/**
 * Radix Select rule: <SelectItem value="" /> is not allowed.
 * We use a sentinel value for placeholders and map it back to "" in state.
 */
const NONE = "__none__"

const SERVICE_OPTIONS = [
  { label: "Service", value: NONE },
  { label: "Inpatient", value: "inpatient" },
  { label: "Outpatient", value: "outpatient" },
  { label: "Labs", value: "labs" },
  { label: "Pharmacy", value: "pharmacy" },
]

const LOCATION_OPTIONS = [
  { label: "Location", value: NONE },
  { label: "Abuja", value: "abuja" },
  { label: "Lagos", value: "lagos" },
  { label: "Kano", value: "kano" },
  { label: "Rivers", value: "rivers" },
]

export function ProviderFiltersRow({ value, onChange }: Props) {
  const [filters, setFilters] = React.useState<Filters>({
    service: value?.service ?? "",
    location: value?.location ?? "",
  })

  function patch<K extends keyof Filters>(k: K, v: Filters[K]) {
    const normalized = (v === (NONE as any) ? "" : v) as Filters[K]
    const next = { ...filters, [k]: normalized }
    setFilters(next)
    onChange?.(next)
  }

  // what PillSelect receives (never pass "" if it becomes a SelectItem)
  const uiService = filters.service || NONE
  const uiLocation = filters.location || NONE

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-4 flex justify-end items-end">
      <div className="flex flex-wrap gap-4">
        <PillSelect
          label="Service"
          value={uiService}
          onChange={(v) => patch("service", v as any)}
          options={SERVICE_OPTIONS}
        />
        <PillSelect
          label="Location"
          value={uiLocation}
          onChange={(v) => patch("location", v as any)}
          options={LOCATION_OPTIONS}
        />
      </div>
    </div>
  )
}
