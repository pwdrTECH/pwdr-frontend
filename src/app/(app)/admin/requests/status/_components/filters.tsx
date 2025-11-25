"use client";

import { DateRangePicker } from "@/components/filters/date-range";
import { SearchField } from "@/components/filters/search";

export type RequestsFilters = {
  q: string;
  hmo: string | "all";
  status: string | "all";
  dateFrom?: Date;
  dateTo?: Date;
};

interface RequestsFilterBarProps {
  value: RequestsFilters;
  onChange: (v: RequestsFilters) => void;
}

export function RequestsFilterBar({ value, onChange }: RequestsFilterBarProps) {
  const set = (patch: Partial<RequestsFilters>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="w-full flex flex-wrap gap-2">
      {/* Search */}
      <SearchField
        value={value.q}
        onChange={(text) => set({ q: text })}
        placeholder="Search Requests"
      />

      {/* Date range using reusable component */}
      <DateRangePicker
        onChange={(start, end) => {
          set({
            dateFrom: start ? new Date(start) : undefined,
            dateTo: end ? new Date(end) : undefined,
          });
        }}
      />
    </div>
  );
}
