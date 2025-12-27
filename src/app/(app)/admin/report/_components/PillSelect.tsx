"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

type Option = { label: string; value: string }

type Props = {
  label: string
  value?: string
  onChange?: (value: string) => void
  options: Option[]
  className?: string
  placeholder?: string
}

export function PillSelect({
  label,
  value = "",
  onChange,
  options,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false)

  const selectedLabel = options.find((o) => o.value === value)?.label ?? label

  return (
    <div className={cn("relative w-[140px]", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full h-10",
          "rounded-[12px] border border-[#0000001A] bg-[#F8F8F8]",
          "shadow-[0px_1px_2px_0px_#1018280D]",
          "px-3.5 py-2.5",
          "flex items-center justify-between gap-2",
          "text-[12px]/[18px] text-[#667085]"
        )}
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <>
          {/* click-away */}
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          {/* menu */}
          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-[12px] border border-[#EAECF0] bg-white shadow-lg">
            <div className="max-h-60 overflow-auto p-1">
              {options.map((opt) => {
                const active = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange?.(opt.value)
                      setOpen(false)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-[10px]",
                      "text-[13px]/[18px]",
                      active
                        ? "bg-[#F2F4F7] text-[#101828]"
                        : "text-[#344054] hover:bg-[#F9FAFB]"
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
