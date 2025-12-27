"use client"

import { CancelButton } from "@/components/form/button"
import { FilterIcon } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import * as React from "react"

type StatusValue = "active" | "pending" | "suspended" | "inactive"

export type FiltersBarProps = {
  search?: string
  onSearchChange?: (v: string) => void

  statuses?: StatusValue[]
  plans?: string[]
  onChangeFilters?: (filters: {
    statuses: StatusValue[]
    plans: string[]
  }) => void

  planOptions?: string[]

  onAddEnrollee?: () => void

  searchChipText?: string
  className?: string
}

export function Filters({
  search = "",
  onSearchChange,
  statuses = [],
  plans = [],
  onChangeFilters,
  planOptions = ["NHIS", "PHIS", "TSHIP", "NYSC"],
  className,
}: FiltersBarProps) {
  const [open, setOpen] = React.useState(false)

  const [draftStatuses, setDraftStatuses] =
    React.useState<StatusValue[]>(statuses)
  const [draftPlans, setDraftPlans] = React.useState<string[]>(plans)

  React.useEffect(() => setDraftStatuses(statuses), [statuses])
  React.useEffect(() => setDraftPlans(plans), [plans])

  const activeCount = statuses.length + plans.length

  function toggleArray<T>(arr: T[], value: T): T[] {
    return arr.includes(value)
      ? arr.filter((x) => x !== value)
      : [...arr, value]
  }

  function applyFilters() {
    onChangeFilters?.({ statuses: draftStatuses, plans: draftPlans })
    setOpen(false)
  }

  function clearFilters() {
    setDraftStatuses([])
    setDraftPlans([])
    onChangeFilters?.({ statuses: [], plans: [] })
    setOpen(false)
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Search */}
      <div className="relative w-[308px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Patient ID/Name"
          className={cn(
            "h-[40px] rounded-[12px] bg-[#F8F8F8] border border-[#0000001A]",
            "pl-9 pr-[14px] py-[10px]",
            "shadow-[0px_1px_2px_0px_#1018280D]",
            "placeholder:text-[#667085]"
          )}
        />
      </div>

      {/* Filter pill */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-[40px] rounded-[12px] border-[#D0D5DD] bg-[#F8F8F8]",
              "shadow-[0px_1px_2px_0px_#1018280D]",
              "px-[14px] gap-2 text-[#344054] hover:bg-[#F8F8F8] hover:text-[#344054]"
            )}
          >
            <span className="flex items-center gap-2">
              <span className="text-[14px]/[20px] font-hnd font-medium">
                Filter
              </span>

              {activeCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E5EFFD] px-1.5 text-[12px] font-bold text-[#2F6FE5]">
                  {activeCount > 99 ? "99+" : activeCount}
                </span>
              )}
            </span>

            <FilterIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[420px] rounded-2xl border border-[#EAECF0] bg-white p-0 shadow-lg overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#EAECF0] text-sm font-semibold text-[#111827]">
            Filters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Status */}
            <div>
              <div className="text-sm font-semibold text-[#111827] mb-3">
                Status
              </div>
              <div className="flex flex-col gap-3">
                {(
                  [
                    "active",
                    "pending",
                    "suspended",
                    "inactive",
                  ] as StatusValue[]
                ).map((s) => (
                  <label htmlFor="" key={s} className="flex items-center gap-3">
                    <Checkbox
                      checked={draftStatuses.includes(s)}
                      onCheckedChange={() =>
                        setDraftStatuses((prev) => toggleArray(prev, s))
                      }
                    />
                    <span className="text-sm text-[#475467] capitalize">
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Plans */}
            <div>
              <div className="text-sm font-semibold text-[#111827] mb-3">
                Plans
              </div>
              <div className="flex flex-col gap-3">
                {planOptions.map((p) => (
                  <label htmlFor="" key={p} className="flex items-center gap-3">
                    <Checkbox
                      checked={draftPlans.includes(p)}
                      onCheckedChange={() =>
                        setDraftPlans((prev) => toggleArray(prev, p))
                      }
                    />
                    <span className="text-sm text-[#475467]">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 pb-4">
            <CancelButton onClick={clearFilters} text="Clear" />
            <Button
              type="button"
              onClick={applyFilters}
              className="h-9 bg-secondary px-5 text-sm text-white hover:bg-secondary/80"
            >
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
