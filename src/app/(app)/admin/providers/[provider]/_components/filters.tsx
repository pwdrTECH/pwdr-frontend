"use client";

import { SearchField } from "@/components/filters/search";
import { FilterSelect } from "@/components/filters/select";

interface FiltersProps {
  onSearchChange: (value: string) => void;
  onCostChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function Filters({
  onSearchChange,
  onCostChange,
  onStatusChange,
}: FiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F9FAFB] border border-[#EAECF0] p-5 rounded-[12px]">
      {/*  Search */}
      <SearchField
        label="Search for tariff"
        placeholder="Search"
        onChange={onSearchChange}
      />

      {/*  Cost */}
      <FilterSelect
        label="Cost"
        value="min-max"
        onChange={onCostChange}
        placeholder="Min-Max"
        options={[
          { value: "min-max", label: "Min-Max" },
          { value: "0-10000", label: "₦0 - ₦10,000" },
          { value: "10000-30000", label: "₦10,000 - ₦30,000" },
          { value: "30000+", label: "₦30,000+" },
        ]}
      />

      {/*  Status */}
      <FilterSelect
        label="Status"
        value="approved"
        onChange={onStatusChange}
        placeholder="Approved"
        options={[
          { value: "approved", label: "Approved" },
          { value: "pending", label: "Pending" },
          { value: "all", label: "All" },
        ]}
      />
    </div>
  );
}
