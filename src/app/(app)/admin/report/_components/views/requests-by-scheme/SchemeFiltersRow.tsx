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

export type FilterOption = {
  label: string
  value: string
}

type Props = {
  value?: Partial<SchemeFilters>
  onChange?: (next: SchemeFilters) => void

  /** ✅ Backend-driven dropdown options (pass these from the view) */
  schemeOptions?: FilterOption[]
  planOptions?: FilterOption[]

  /** Optional if you later want backend-driven service/location too */
  serviceOptions?: FilterOption[]
  locationOptions?: FilterOption[]
}

const DEFAULT_SERVICE_OPTIONS: FilterOption[] = [
  { label: "Service", value: "__all__" },
  { label: "Consultation", value: "consultation" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Labs", value: "labs" },
]

const DEFAULT_LOCATION_OPTIONS: FilterOption[] = [
  { label: "Location", value: "__all__" },
  { label: "Abuja", value: "abuja" },
  { label: "Lagos", value: "lagos" },
  { label: "Kano", value: "kano" },
]

const COST_RANGE_OPTIONS: FilterOption[] = [
  { label: "Cost Range", value: "__all__" },
  { label: "₦0 - ₦100,000", value: "0-100k" },
  { label: "₦100,000 - ₦500,000", value: "100k-500k" },
  { label: "₦500,000+", value: "500k+" },
]

function hasValue(options: FilterOption[], value: string) {
  return options.some((o) => o.value === value)
}

function ensureAllOption(
  options: FilterOption[] | undefined,
  allLabel: string
): FilterOption[] {
  const all: FilterOption = { label: allLabel, value: "__all__" }
  const safe = Array.isArray(options) ? options.filter(Boolean) : []

  if (!safe.length) return [all]

  const providedAll = safe.find((o) => o.value === "__all__")
  const head = providedAll ?? all
  const rest = safe.filter((o) => o.value !== "__all__")

  return [head, ...rest]
}

export function SchemeFiltersRow({
  value,
  onChange,
  schemeOptions,
  planOptions,
  serviceOptions,
  locationOptions,
}: Props) {
  const SERVICE_OPTIONS = React.useMemo(
    () => ensureAllOption(serviceOptions ?? DEFAULT_SERVICE_OPTIONS, "Service"),
    [serviceOptions]
  )

  const LOCATION_OPTIONS = React.useMemo(
    () =>
      ensureAllOption(locationOptions ?? DEFAULT_LOCATION_OPTIONS, "Location"),
    [locationOptions]
  )

  const SCHEME_OPTIONS = React.useMemo(
    () => ensureAllOption(schemeOptions, "Schemes"),
    [schemeOptions]
  )

  const PLAN_OPTIONS = React.useMemo(
    () => ensureAllOption(planOptions, "Plan"),
    [planOptions]
  )

  const [filters, setFilters] = React.useState<SchemeFilters>({
    service: value?.service ?? "__all__",
    location: value?.location ?? "__all__",
    scheme: value?.scheme ?? "__all__",
    plan: value?.plan ?? "__all__",
    costRange: value?.costRange ?? "__all__",
  })

  const onChangeRef = React.useRef<Props["onChange"]>(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  React.useEffect(() => {
    if (!value) return

    setFilters((prev) => {
      const next: SchemeFilters = {
        service: value.service ?? prev.service,
        location: value.location ?? prev.location,
        scheme: value.scheme ?? prev.scheme,
        plan: value.plan ?? prev.plan,
        costRange: value.costRange ?? prev.costRange,
      }

      const same =
        next.service === prev.service &&
        next.location === prev.location &&
        next.scheme === prev.scheme &&
        next.plan === prev.plan &&
        next.costRange === prev.costRange

      return same ? prev : next
    })
  }, [value])

  React.useEffect(() => {
    setFilters((prev) => {
      let changed = false
      const next: SchemeFilters = { ...prev }

      if (!hasValue(SERVICE_OPTIONS, prev.service)) {
        next.service = "__all__"
        changed = true
      }
      if (!hasValue(LOCATION_OPTIONS, prev.location)) {
        next.location = "__all__"
        changed = true
      }
      if (!hasValue(SCHEME_OPTIONS, prev.scheme)) {
        next.scheme = "__all__"
        changed = true
      }
      if (!hasValue(PLAN_OPTIONS, prev.plan)) {
        next.plan = "__all__"
        changed = true
      }

      if (changed) onChangeRef.current?.(next)
      return changed ? next : prev
    })
  }, [SERVICE_OPTIONS, LOCATION_OPTIONS, SCHEME_OPTIONS, PLAN_OPTIONS])

  function patch<K extends keyof SchemeFilters>(k: K, v: SchemeFilters[K]) {
    setFilters((prev) => {
      const next = { ...prev, [k]: v }
      onChangeRef.current?.(next)
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
