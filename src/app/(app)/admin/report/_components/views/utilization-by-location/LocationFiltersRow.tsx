"use client"

import * as React from "react"
import { PillSelect } from "../../PillSelect"
import { useSchemes, usePlansByScheme } from "@/lib/api/schemes"
import { DateRangePicker } from "@/components/filters/date-range"
import { LOCATION_OPTIONS } from "@/lib/data"

export type LocationFilters = {
  service: string
  location: string
  scheme: string
  plan: string
  startDate: string | null
  endDate: string | null
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

const COST_RANGE_OPTIONS = [
  { label: "Cost Range", value: "all" },
  { label: "₦0 - ₦100,000", value: "0-100k" },
  { label: "₦100,000 - ₦500,000", value: "100k-500k" },
  { label: "₦500,000 - ₦1,000,000", value: "500k-1m" },
  { label: "₦1,000,000+", value: "1m+" },
]

function ensureAll(v?: string) {
  return v && String(v).trim() ? String(v) : "all"
}

export function LocationFiltersRow({ value, onChange }: Props) {
  const [filters, setFilters] = React.useState<LocationFilters>({
    service: ensureAll(value?.service),
    location: ensureAll(value?.location),
    scheme: ensureAll(value?.scheme),
    plan: ensureAll(value?.plan),
    startDate: value?.startDate ?? null,
    endDate: value?.endDate ?? null,
    costRange: ensureAll(value?.costRange),
  })

  // Fetch schemes + plans
  const schemesQuery = useSchemes()
  const schemeId = filters.scheme !== "all" ? Number(filters.scheme) : undefined
  const plansQuery = usePlansByScheme(schemeId)

  // Options from backend
  const SCHEME_OPTIONS = React.useMemo(() => {
    const base = [{ label: "Schemes", value: "all" }]
    const schemes = schemesQuery.data ?? []
    const mapped = schemes.map((s: any) => ({
      label: String(s.name ?? s.scheme_name ?? "—"),
      value: String(s.id),
    }))
    return [...base, ...mapped]
  }, [schemesQuery.data])

  const PLAN_OPTIONS = React.useMemo(() => {
    const base = [{ label: "Plan", value: "all" }]
    const plans = plansQuery.data ?? []
    const mapped = plans.map((p: any) => ({
      label: String(p.name ?? "—"),
      value: String(p.id),
    }))
    return [...base, ...mapped]
  }, [plansQuery.data])

  function patch<K extends keyof LocationFilters>(k: K, v: LocationFilters[K]) {
    const next = { ...filters, [k]: v }
    setFilters(next)
    onChange?.(next)
  }

  function patchScheme(nextScheme: string) {
    // reset plan when scheme changes
    const next = { ...filters, scheme: nextScheme, plan: "all" }
    setFilters(next)
    onChange?.(next)
  }

  function patchDateRange(start: string | null, end: string | null) {
    const next = { ...filters, startDate: start, endDate: end }
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
          onChange={(v) => patchScheme(v)}
          options={SCHEME_OPTIONS}
        />

        <PillSelect
          label="Plan"
          value={filters.plan}
          onChange={(v) => patch("plan", v)}
          options={PLAN_OPTIONS}
        />

        <DateRangePicker
          onChange={(start, end) => patchDateRange(start, end)}
          triggerClassName="w-[170px]"
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
