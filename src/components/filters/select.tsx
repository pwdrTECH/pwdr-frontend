"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReactNode } from "react";

type Option = {
  label: string;
  value: string;
};

interface FilterSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  options: Option[];
  label?: string | ReactNode;
  /** Optional: extra classes for the trigger */
  triggerClassName?: string;
}

export function FilterSelect({
  value,
  onChange,
  placeholder = "Select option",
  options,
  label,
  triggerClassName,
}: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor="status"
          className="block text-[14px]/[20px] font-hnd font-medium text-[#344054]"
        >
          Status
        </label>
      )}
      <Select value={value} onValueChange={(v) => onChange?.(v)}>
        <SelectTrigger
          className={
            triggerClassName ??
            "py-2.5 px-3.5 data-[size=default]:h-10 text-sm rounded-[12px] border border-[#0000001A] bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D]"
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
