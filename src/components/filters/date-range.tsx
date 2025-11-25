"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "@/components/svgs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  onChange?: (start: string | null, end: string | null) => void;
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  startLabel?: string;
  endLabel?: string;
  clearText?: string;
  applyText?: string;
}

export function DateRangePicker({
  onChange,
  placeholder = "Date Range",
  triggerClassName,
  contentClassName,
  startLabel = "Start Date",
  endLabel = "End Date",
  clearText = "Clear",
  applyText = "Apply",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);

  const handleStart = (value: string) => {
    setStart(value);
    onChange?.(value || null, end);
  };

  const handleEnd = (value: string) => {
    setEnd(value);
    onChange?.(start, value || null);
  };

  const clear = () => {
    setStart(null);
    setEnd(null);
    onChange?.(null, null);
  };

  const display =
    start && end ? `${start} - ${end}` : start ? start : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`
            w-fit gap-2 h-10 font-normal text-sm rounded-[12px]
            py-2.5 px-2 text-[#667085] bg-[#F8F8F8]
            shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]
            hover:bg-transparent hover:text-[#667085]
            ${triggerClassName || ""}
          `}
        >
          {display}
          <CalendarIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={`w-64 p-4 ${contentClassName || ""}`}
      >
        <div className="flex flex-col gap-4">
          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="start" className="text-sm font-medium">
              {startLabel}
            </label>
            <Input
              type="date"
              value={start || ""}
              onChange={(e) => handleStart(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="end" className="text-sm font-medium">
              {endLabel}
            </label>
            <Input
              type="date"
              value={end || ""}
              onChange={(e) => handleEnd(e.target.value)}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-between gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="h-[34px]"
            >
              {clearText}
            </Button>

            <Button
              size="sm"
              onClick={() => setOpen(false)}
              className="h-[34px]"
            >
              {applyText}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
