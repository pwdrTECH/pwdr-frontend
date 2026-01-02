"use client"

import * as React from "react"
import { PillSelect } from "../../PillSelect"
import { LOCATION_OPTIONS } from "@/lib/data"

/* =========================================================
   Types
========================================================= */

export type Filters = {
  service: string
  location: string
}

export type FilterOption = {
  label: string
  value: string
}

type Props = {
  value?: Partial<Filters>
  onChange?: (next: Filters) => void
  serviceOptions?: FilterOption[]
}

/**
 * Radix Select rule:
 * value="" is NOT allowed for SelectItem
 */
const NONE = "__none__"

/* =========================================================
   Component
========================================================= */

export function ProviderFiltersRow({ value, onChange, serviceOptions }: Props) {
  const [filters, setFilters] = React.useState<Filters>({
    service: value?.service ?? "",
    location: value?.location ?? "",
  })

  /**
   * Patch helper
   */
  function patch<K extends keyof Filters>(key: K, v: Filters[K]) {
    const normalized = v === (NONE as Filters[K]) ? ("" as Filters[K]) : v

    const next = { ...filters, [key]: normalized }
    setFilters(next)
    onChange?.(next)
  }

  /**
   * UI-safe values (never empty string)
   */
  const uiService = filters.service || NONE
  const uiLocation = filters.location || NONE

  /**
   * Build service dropdown options
   */
  const resolvedServiceOptions = React.useMemo<FilterOption[]>(() => {
    if (Array.isArray(serviceOptions) && serviceOptions.length > 0) {
      return [{ label: "Service", value: NONE }, ...serviceOptions]
    }

    // fallback when backend data not ready
    return [{ label: "Service", value: NONE }]
  }, [serviceOptions])

  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-4 flex justify-end items-end">
      <div className="flex flex-wrap gap-4">
        {/* Service */}
        <PillSelect
          label="Service"
          value={uiService}
          onChange={(v) => patch("service", v as Filters["service"])}
          options={resolvedServiceOptions}
        />

        {/* Location */}
        <PillSelect
          label="Location"
          value={uiLocation}
          onChange={(v) => patch("location", v as Filters["location"])}
          options={LOCATION_OPTIONS}
        />
      </div>
    </div>
  )
}
