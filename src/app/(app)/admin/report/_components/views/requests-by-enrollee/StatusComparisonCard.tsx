"use client"

import { EyeVisibilityOff } from "@/components/svgs"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import * as React from "react"
import { StatusDonut } from "./StatusDonut"
import { StatusLegend } from "./StatusLegend"
import type { RangeKey } from "./StatusRangePills"
import { StatusRangePills } from "./StatusRangePills"

type StatusKey = "approved" | "rejected" | "pending"

export type StatusDatum = {
  key: StatusKey
  label: string
  value: number
  amount: string
  percentChip: string
  color: string
}

type StatusSummary = {
  // counts (optional – depends on your backend)
  approved_count?: number
  rejected_count?: number
  pending_count?: number

  // amounts (optional)
  approved_amount?: number
  rejected_amount?: number
  pending_amount?: number

  // totals (optional – can be derived)
  total_count?: number
  total_amount?: number
}

type Props = {
  title?: string
  totalTitle?: string

  /** Provide totals OR provide summary that contains totals */
  totalCount?: number
  totalAmount?: string

  /** If you already have full data array, you can pass it */
  data?: StatusDatum[]

  /** OR pass summary and we will build the data array */
  summary?: StatusSummary

  range?: RangeKey
  onRangeChange?: (v: RangeKey) => void
}

const COLORS: Record<StatusKey, string> = {
  approved: "#02A32D",
  rejected: "#F85E5E",
  pending: "#F4BF13",
}

const LABELS: Record<StatusKey, string> = {
  approved: "Approved",
  rejected: "Rejected",
  pending: "Pending",
}

function toNumber(v: any): number {
  const n =
    typeof v === "number" ? v : Number(String(v ?? "0").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function formatNaira(v: number) {
  return `₦${toNumber(v).toLocaleString("en-NG", {
    maximumFractionDigits: 0,
  })}`
}

function formatPct(value: number, total: number) {
  if (!total) return "0%"
  const pct = (value / total) * 100
  return `${Math.round(pct)}%`
}

function buildFromSummary(summary?: StatusSummary): {
  data: StatusDatum[]
  totalCount: number
  totalAmount: string
} {
  const approved = toNumber(summary?.approved_count)
  const rejected = toNumber(summary?.rejected_count)
  const pending = toNumber(summary?.pending_count)

  const approvedAmt = toNumber(summary?.approved_amount)
  const rejectedAmt = toNumber(summary?.rejected_amount)
  const pendingAmt = toNumber(summary?.pending_amount)

  const totalCount =
    toNumber(summary?.total_count) || approved + rejected + pending

  const totalAmountNum =
    toNumber(summary?.total_amount) || approvedAmt + rejectedAmt + pendingAmt

  const mk = (
    key: StatusKey,
    value: number,
    amountNum: number
  ): StatusDatum => ({
    key,
    label: LABELS[key],
    value,
    amount: formatNaira(amountNum),
    percentChip: formatPct(value, totalCount),
    color: COLORS[key],
  })

  return {
    data: [
      mk("approved", approved, approvedAmt),
      mk("rejected", rejected, rejectedAmt),
      mk("pending", pending, pendingAmt),
    ],
    totalCount,
    totalAmount: formatNaira(totalAmountNum),
  }
}

export function StatusComparisonCard({
  title = "Status Comparison",
  totalTitle = "Total Claims",
  totalCount: totalCountProp,
  totalAmount: totalAmountProp,
  data: dataProp,
  summary,
  range: rangeProp,
  onRangeChange,
}: Props) {
  const [rangeState, setRangeState] = React.useState<RangeKey>("month")
  const [hidden, setHidden] = React.useState(false)

  const range = rangeProp ?? rangeState
  const setRange = onRangeChange ?? setRangeState

  // ✅ Build effective data (summary > data prop > fallback zeros)
  const computed = React.useMemo(() => buildFromSummary(summary), [summary])

  const effectiveData =
    dataProp && dataProp.length > 0 ? dataProp : computed.data

  const effectiveTotalCount =
    typeof totalCountProp === "number" ? totalCountProp : computed.totalCount

  const effectiveTotalAmount =
    typeof totalAmountProp === "string" ? totalAmountProp : computed.totalAmount

  return (
    <div
      className={cn(
        "w-full bg-white border border-[#EAECF0]",
        "rounded-[16px] p-4",
        "h-[338px]"
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="text-[18px] leading-[100%] font-medium text-[#7A7A7A]">
          {title}
        </div>

        <div className="flex h-[42px] w-[269px] items-center justify-end gap-4">
          <StatusRangePills value={range} onChange={setRange} />

          <button
            type="button"
            aria-label={hidden ? "Show" : "Hide"}
            onClick={() => setHidden((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] cursor-pointer"
          >
            {hidden ? (
              <Eye className="text-[#939FB3] h-[30px] w-[30px]" />
            ) : (
              <EyeVisibilityOff />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {hidden ? (
        <div className="mt-6 flex h-[240px] w-full items-center justify-center rounded-[12px] border border-dashed border-[#EAECF0] text-[14px] text-[#98A2B3]">
          Hidden
        </div>
      ) : (
        <div
          className={cn(
            "mt-6 flex w-[1030px] h-[240px] items-center justify-between",
            "gap-[68px] px-[90px]"
          )}
        >
          <StatusDonut
            data={effectiveData}
            totalTitle={totalTitle}
            totalCount={effectiveTotalCount}
            totalAmount={effectiveTotalAmount}
          />
          <StatusLegend data={effectiveData} />
        </div>
      )}
    </div>
  )
}
