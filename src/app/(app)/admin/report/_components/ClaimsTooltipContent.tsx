"use client"

import type { TooltipProps } from "recharts"
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent"
import { CustomTooltip } from "./ClaimsTooltip"

type ChartPoint = {
  m: string
  approved?: number
  pending?: number
  rejected?: number
  approvedAmount?: number | string
  pendingAmount?: number | string
  rejectedAmount?: number | string
}

function formatNaira(v: number | string | undefined) {
  if (v == null || v === "") return "—"
  const n = typeof v === "string" ? Number(v) : v
  if (Number.isNaN(n)) return "—"
  return `₦${n.toLocaleString("en-NG")}`
}

export function CustomTooltipContent(
  props: TooltipProps<ValueType, NameType> & {
    activeKey?: "all" | "approved" | "pending" | "rejected"
  }
) {
  const { active, payload, label, activeKey = "approved" } = props
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload as ChartPoint | undefined
  if (!row) return null

  const status =
    activeKey === "approved"
      ? "Approved"
      : activeKey === "pending"
      ? "Pending"
      : "Rejected"

  const count =
    activeKey === "approved"
      ? row.approved ?? 0
      : activeKey === "pending"
      ? row.pending ?? 0
      : row.rejected ?? 0

  const amount =
    activeKey === "approved"
      ? formatNaira(row.approvedAmount)
      : activeKey === "pending"
      ? formatNaira(row.pendingAmount)
      : formatNaira(row.rejectedAmount)

  return (
    <CustomTooltip
      month={String(label ?? row.m ?? "")}
      status={status}
      count={count}
      amount={amount}
    />
  )
}
