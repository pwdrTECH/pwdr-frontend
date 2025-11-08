"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type DashboardFilters = {
  q: string
  period: "this-month" | "last-3" | "last-6" | "last-12"
  status: "all" | "approved" | "queried" | "unattended"
  hmos: string[] // slugs
}

const HMO_OPTIONS = [
  { label: "Apex Health", value: "apex" },
  { label: "ZenCare", value: "zencare" },
  { label: "MedicPlus", value: "medicplus" },
  { label: "BluePeak", value: "bluepeak" },
]

type Props = {
  defaultValue?: Partial<DashboardFilters>
  onApply: (filters: DashboardFilters) => void
  onClear?: () => void
}

export function FilterBar({ defaultValue, onApply, onClear }: Props) {
  const [open, setOpen] = React.useState(false)
  const [local, setLocal] = React.useState<DashboardFilters>({
    q: defaultValue?.q ?? "",
    period: defaultValue?.period ?? "this-month",
    status: defaultValue?.status ?? "all",
    hmos: defaultValue?.hmos ?? [],
  })

  function toggleHmo(v: string) {
    setLocal((prev) => {
      const exists = prev.hmos.includes(v)
      return {
        ...prev,
        hmos: exists ? prev.hmos.filter((x) => x !== v) : [...prev.hmos, v],
      }
    })
  }

  function clearAll() {
    const base: DashboardFilters = {
      q: "",
      period: "this-month",
      status: "all",
      hmos: [],
    }
    setLocal(base)
    onClear?.()
    onApply(base)
  }

  return (
    <div className="grid w-full grid-cols-1 gap-2 rounded-lg border border-[#E8ECF3] bg-white p-2 sm:grid-cols-2 lg:grid-cols-[1fr_max-content_max-content_max-content]">
      {/* Search */}
      <Input
        placeholder="Search claims, patients, IDs…"
        value={local.q}
        onChange={(e) => setLocal((s) => ({ ...s, q: e.target.value }))}
        className="h-9"
      />

      {/* Period */}
      <Select
        value={local.period}
        onValueChange={(v: DashboardFilters["period"]) =>
          setLocal((s) => ({ ...s, period: v }))
        }
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-3">Last 3 Months</SelectItem>
          <SelectItem value="last-6">Last 6 Months</SelectItem>
          <SelectItem value="last-12">Last 12 Months</SelectItem>
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={local.status}
        onValueChange={(v: DashboardFilters["status"]) =>
          setLocal((s) => ({ ...s, status: v }))
        }
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="queried">Queried</SelectItem>
          <SelectItem value="unattended">Unattended</SelectItem>
        </SelectContent>
      </Select>

      {/* HMOs (multi) */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 justify-between">
            <span className="truncate">
              {local.hmos.length
                ? `${local.hmos.length} HMO${
                    local.hmos.length > 1 ? "s" : ""
                  } selected`
                : "HMOs"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                {HMO_OPTIONS.map((h) => {
                  const checked = local.hmos.includes(h.value)
                  return (
                    <CommandItem
                      key={h.value}
                      onSelect={() => toggleHmo(h.value)}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{h.label}</span>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          checked ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Actions row (full width on small screens) */}
      <div className="col-span-full mt-1 flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-full">
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Clear
        </Button>
        <Button
          size="sm"
          className="bg-[#0D6E93] hover:bg-[#0D6E93]/90"
          onClick={() => onApply(local)}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
