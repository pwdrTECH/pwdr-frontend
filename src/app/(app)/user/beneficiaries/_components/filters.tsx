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
import { Search, X } from "lucide-react"
import * as React from "react"

type StatusValue = "active" | "pending" | "suspended" | "inactive"

export type FiltersBarProps = {
  /** Search value */
  search?: string
  onSearchChange?: (v: string) => void

  /** Filters (controlled) */
  statuses?: StatusValue[]
  plans?: string[]
  onChangeFilters?: (filters: {
    statuses: StatusValue[]
    plans: string[]
  }) => void

  /** Available plans to list in the popover */
  planOptions?: string[]

  /** Add-enrollee action */
  onAddEnrollee?: () => void

  /** Optional chip over the search input */
  searchChipText?: string
  className?: string
}

export default function Filters({
  search = "",
  onSearchChange,
  statuses = [],
  plans = [],
  onChangeFilters,
  planOptions = ["NHIS", "PHIS", "TSHIP", "NYSC"],
}: FiltersBarProps) {
  const [open, setOpen] = React.useState(false)

  // local draft while popover is open (so Cancel can revert)
  const [draftStatuses, setDraftStatuses] =
    React.useState<StatusValue[]>(statuses)
  const [draftPlans, setDraftPlans] = React.useState<string[]>(plans)

  React.useEffect(() => setDraftStatuses(statuses), [statuses, open])
  React.useEffect(() => setDraftPlans(plans), [plans, open])

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
    <div className="flex w-full gap-2 sm:w-auto">
      {/* Search (Enrollee ID) */}
      <div className="relative w-full sm:w-[200px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B4B4B4]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search"
          className="h-10 w-full rounded-[12px] pl-9 py-2.5 pr-4 bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]"
        />
      </div>

      {/* Filter pill -> Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className={cn(
              "relative h-10 w-full sm:w-[150px] justify-between",
              "rounded-[12px] border border-[#0000001A] bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D]",
              "px-[14px] py-2.5 tracking-normal text-[14px]/[20px] text-[#667085]  hover:text-[#667085]",
              "hover:bg-[#F8F8F8]"
            )}
            variant="ghost"
          >
            <span className="flex items-center gap-3">
              <span>Filter</span>
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-[#E5EFFD] text-[#2F6FE5] text-sm font-bold h-6 min-w-6 px-2">
                  {activeCount}
                </span>
              )}
            </span>
            <FilterIcon />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className={cn(
            "w-[400px] rounded-2xl border shadow-lg p-0 overflow-hidden"
          )}
        >
          <div className="px-4 py-3 border-b text-sm font-semibold text-[#111827]">
            Filters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {/* Statuses */}
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
                  <label key={s} className="flex items-center gap-3">
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
                  <label key={p} className="flex items-center gap-3">
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
            <Button type="button" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
