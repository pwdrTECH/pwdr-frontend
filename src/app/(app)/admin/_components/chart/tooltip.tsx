"use client"

import * as React from "react"
import type { TooltipProps } from "recharts"
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent"

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return `${n}`
}

export function ClaimsTooltip(props: TooltipProps<ValueType, NameType>) {
  const { active, label, payload } = props
  if (!active || !payload?.length) return null

  const p =
    payload.find((x) => (x.dataKey as string) === "claims") ?? payload[0]
  const value = Number(p?.value ?? 0)

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-md">
      <div className="text-[12px] font-medium text-muted-foreground">
        {String(label)}
      </div>
      <div className="mt-1 text-[14px] font-semibold text-foreground">
        {value.toLocaleString()}{" "}
        <span className="ml-1 text-[12px] font-normal text-muted-foreground">
          ({formatCompact(value)})
        </span>
      </div>
    </div>
  )
}
