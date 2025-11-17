"use client";

import { CancelButton } from "@/components/form/button";
import { FilterIcon } from "@/components/svgs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState } from "react";

type StatusValue = "Pending" | "Approved";

interface ClaimFiltersProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  /** applied statuses from parent (we treat this as source of truth) */
  statuses?: StatusValue[];
  onStatusChange?: (statuses: StatusValue[]) => void;
}

export default function ClaimFilters({
  search = "",
  onSearchChange,
  statuses = [],
  onStatusChange,
}: ClaimFiltersProps) {
  const [open, setOpen] = useState(false);

  // local draft state used inside the popover before pressing "Apply"
  const [draftStatuses, setDraftStatuses] = useState<StatusValue[]>(statuses);

  const statusOptions: StatusValue[] = ["Pending", "Approved"];

  // number of *applied* filters, not draft
  const activeCount = statuses.length;

  function toggleStatus(status: StatusValue) {
    setDraftStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  }

  function applyFilters() {
    onStatusChange?.(draftStatuses);
    setOpen(false);
  }

  function clearFilters() {
    setDraftStatuses([]);
    onStatusChange?.([]);
    setOpen(false);
  }

  return (
    <div className="flex w-full gap-2 sm:w-auto items-center">
      {/* Search Input */}
      <div className="relative w-full sm:w-[200px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B4B4B4]" />
        <Input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Enrollee ID / Claim ID"
          className="text-sm h-10 w-full rounded-[12px] pl-9 py-2.5 pr-4 bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]"
        />
      </div>

      {/* Status Filter Popover */}
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          // when opening, reset draft to the latest applied statuses
          if (nextOpen) {
            setDraftStatuses(statuses);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "text-sm relative h-10 w-full sm:w-[150px] justify-between",
              "rounded-[12px] border border-[#0000001A] bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D]",
              "px-[14px] py-2.5 tracking-normal text-[14px]/[20px] text-[#667085]  hover:text-[#667085]",
              "hover:bg-[#F8F8F8]",
            )}
          >
            <span>Filter</span>
            {activeCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold h-5 w-5">
                {activeCount}
              </span>
            )}
            <FilterIcon />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-64 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-3">Status</h3>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label
                    htmlFor="status"
                    key={status}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={draftStatuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    />
                    <span className="text-sm text-foreground">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t justify-between">
              <CancelButton
                text="Clear"
                className="h-[34px]"
                onClick={clearFilters}
              />

              <Button size="sm" className="h-[34px]" onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
