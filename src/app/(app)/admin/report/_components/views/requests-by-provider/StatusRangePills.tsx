"use client"

import { cn } from "@/lib/utils"

export type RangeKey = "day" | "month" | "year" | "all"

export function StatusRangePills({
  value,
  onChange,
}: {
  value: RangeKey
  onChange: (v: RangeKey) => void
}) {
  const items: Array<{ key: RangeKey; label: string }> = [
    { key: "day", label: "Day" },
    { key: "month", label: "Month" },
    { key: "year", label: "Year" },
    { key: "all", label: "All" },
  ]

  return (
    <div className="flex items-center gap-4">
      {items.map((it) =>
        it.key === value ? (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className={cn(
              "rounded-[12px] border border-[#EAECF0] bg-white px-3 py-2",
              "text-[14px] leading-[100%] text-[#212123]",
              "shadow-[0px_1px_2px_0px_#1018280D]"
            )}
          >
            {it.label}
          </button>
        ) : (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className="text-[14px] leading-[100%] text-[#7A7A7A]"
          >
            {it.label}
          </button>
        )
      )}
    </div>
  )
}
