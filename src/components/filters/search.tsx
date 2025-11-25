"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search as SearchIcon } from "lucide-react";

export interface SearchFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchField({
  id = "search",
  label,
  placeholder = "Search",
  value,
  onChange,
  className,
}: SearchFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[14px]/[20px] font-hnd font-medium text-[#344054]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B4B4B4]"
          aria-hidden="true"
        />
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-10 w-full rounded-[12px] pl-9 py-2.5 pr-4 text-sm bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]"
        />
      </div>
    </div>
  );
}
