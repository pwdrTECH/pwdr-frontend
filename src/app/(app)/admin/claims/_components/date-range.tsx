"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "lucide-react"
import { useState } from "react"
import { CalendarIcon } from "@/components/svgs"
import { CancelButton } from "@/components/form/button"

interface DateRangePickerProps {
  onDateRangeChange?: (startDate: string | null, endDate: string | null) => void
}

export default function DateRangePicker({
  onDateRangeChange,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setStartDate(value)
    onDateRangeChange?.(value, endDate)
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEndDate(value)
    onDateRangeChange?.(startDate, value)
  }

  const clearDates = () => {
    setStartDate(null)
    setEndDate(null)
    onDateRangeChange?.(null, null)
  }

  const displayText =
    startDate && endDate
      ? `${startDate} - ${endDate}`
      : startDate
      ? startDate
      : "Date Range"

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-fit gap-2 h-10 font-normal  text-sm rounded-[12px] py-2.5 px-2 text-[#667085] bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F] hover:bg-transparent hover:text-[#667085]"
        >
          {displayText}
          <CalendarIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={startDate || ""}
              onChange={handleStartDateChange}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={endDate || ""}
              onChange={handleEndDateChange}
              className="w-full"
            />
          </div>
          <div className="w-full flex justify-between gap-2 mt-4">
            <CancelButton
              onClick={clearDates}
              text="Clear"
              className="h-[34px]"
            />
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-[34px]"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
