"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { EyeVisibilityOff } from "@/components/svgs"
import { StatusDonut } from "./StatusDonut"
import { StatusLegend } from "./StatusLegend"
import { StatusRangePills, type RangeKey } from "../StatusRangePills"
import { Eye } from "lucide-react"

export type StatusKey = "pending" | "approved" | "denied" | "queried"

export type StatusDatum = {
  key: StatusKey
  label: string
  value: number
  amount: string
  percentChip: string
  color: string
}

type Props = {
  title?: string
  data?: StatusDatum[]
  range?: RangeKey
  onRangeChange?: (v: RangeKey) => void
  /** optional skeleton when loading */
  loading?: boolean
  /** optional empty-state label */
  emptyLabel?: string
}

const DEFAULT_EMPTY: StatusDatum[] = [
  {
    key: "approved",
    label: "Approved",
    value: 0,
    amount: "—",
    percentChip: "0%",
    color: "#02A32D",
  },
  {
    key: "denied",
    label: "Denied",
    value: 0,
    amount: "—",
    percentChip: "0%",
    color: "#F85E5E",
  },
  {
    key: "pending",
    label: "Pending",
    value: 0,
    amount: "—",
    percentChip: "0%",
    color: "#F4BF13",
  },
  {
    key: "queried",
    label: "Queried",
    value: 0,
    amount: "—",
    percentChip: "0%",
    color: "#1671D9",
  },
]

export function StatusComparisonCard({
  title = "Status Comparison",
  data = [],
  range: rangeProp,
  onRangeChange,
  loading = false,
  emptyLabel = "No data",
}: Props) {
  const [rangeState, setRangeState] = React.useState<RangeKey>("month")
  const [hidden, setHidden] = React.useState(false)

  const range = rangeProp ?? rangeState
  const setRange = onRangeChange ?? setRangeState

  const safeData = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return DEFAULT_EMPTY
    return data
  }, [data])

  return (
    <div
      className={cn(
        "w-full xl:h-[390px] bg-white border border-[#EAECF0] rounded-[16px] p-4 flex flex-col gap-8"
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="text-[18px] leading-[100%] font-medium text-[#7A7A7A]">
          {title}
        </div>

        {/* Date filter wrapper */}
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

      {/* Chart content wrapper */}
      <div
        className={cn(
          "flex w-full items-center justify-between",
          "gap-[68px] px-[90px]"
        )}
      >
        {hidden ? (
          <div className="w-full h-full flex items-center justify-center text-[#7A7A7A] text-[14px]">
            Content not visible
          </div>
        ) : loading ? (
          <div className="w-full h-full flex items-center justify-center text-[#7A7A7A] text-[14px]">
            Loading...
          </div>
        ) : (
          <div className="w-full xl:h-[280px] flex flex-col xl:flex-row gap-[73px] justify-between">
            {/* Donut (left) */}
            <StatusDonut data={safeData} />

            {/* Legend (right) */}
            <StatusLegend data={safeData} />
          </div>
        )}
      </div>

      {/* Optional empty label (when all values are 0) */}
      {!hidden &&
        !loading &&
        safeData.every((d) => Number(d.value || 0) === 0) && (
          <div className="w-full text-center text-[12px] text-[#98A2B3] -mt-3">
            {emptyLabel}
          </div>
        )}
    </div>
  )
}
