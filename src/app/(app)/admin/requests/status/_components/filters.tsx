"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon, Search } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type RequestsFilters = {
  q: string
  hmo: string | "all"
  status: string | "all"
  dateFrom?: Date
  dateTo?: Date
}

export function RequestsFilterBar({
  value,
  onChange,
  hmos,
  statuses,
}: {
  value: RequestsFilters
  onChange: (v: RequestsFilters) => void
  hmos: Array<string>
  statuses: Array<string>
}) {
  const set = (patch: Partial<RequestsFilters>) =>
    onChange({ ...value, ...patch })

  // derive a DateRange for the calendar
  const range: DateRange | undefined =
    value.dateFrom || value.dateTo
      ? { from: value.dateFrom, to: value.dateTo }
      : undefined

  return (
    <div className="w-full flex flex-wrap gap-2">
      {/* Search */}
      <div className="relative w-full sm:w-[284px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B4B4B4]" />
        <Input
          value={value.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Search Requests"
          className="h-10 w-full rounded-[12px] pl-9 py-[10px] pr-4 bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]"
        />
      </div>
      {/* Date Range (single range calendar, 2 months) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-[43px] justify-start text-left font-normal hover:bg-transparent hover:text-foreground",
              !range && "text-foreground"
            )}
          >
            {range?.from && range?.to ? (
              <>
                {format(range.from, "PP")} — {format(range.to, "PP")}
              </>
            ) : (
              "Date range"
            )}
            <CalendarIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        {/* Increased tray width with responsive bounds */}
        <PopoverContent className="w-full sm:w-[270px] p-3">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => set({ dateFrom: r?.from, dateTo: r?.to })}
            numberOfMonths={1}
            captionLayout="dropdown"
            defaultMonth={range?.from}
          />
          <div className="mt-3 flex justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => set({ dateFrom: undefined, dateTo: undefined })}
            >
              Clear
            </Button>
            <Button onClick={() => undefined}>Apply</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
