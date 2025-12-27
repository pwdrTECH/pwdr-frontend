"use client"

import { cn } from "@/lib/utils"
import type { KeyboardEvent } from "react"

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

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = items.findIndex((x) => x.key === value)
    if (idx < 0) return

    if (e.key === "ArrowRight") {
      e.preventDefault()
      onChange(items[(idx + 1) % items.length].key)
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      onChange(items[(idx - 1 + items.length) % items.length].key)
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Range"
      onKeyDown={onKeyDown}
      className="flex items-center gap-4"
    >
      {items.map((it) => {
        const active = it.key === value
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.key)}
            className={cn(
              "h-[42px] px-3 rounded-[12px] transition",
              "text-[14px] leading-[100%] cursor-pointer",
              active
                ? cn(
                    "border border-[#EAECF0] bg-white text-[#212123]",
                    "shadow-[0px_1px_2px_0px_#1018280D]"
                  )
                : cn(
                    "border border-transparent bg-transparent text-[#7A7A7A]",
                    "hover:text-[#212123]"
                  ),
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1671D9]/30"
            )}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
