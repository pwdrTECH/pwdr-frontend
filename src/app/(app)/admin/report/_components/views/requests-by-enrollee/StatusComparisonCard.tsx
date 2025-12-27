"use client"

import { EyeVisibilityOff } from "@/components/svgs"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import * as React from "react"
import { StatusDonut } from "./StatusDonut"
import { StatusLegend } from "./StatusLegend"
import type { RangeKey } from "./StatusRangePills"
import { StatusRangePills } from "./StatusRangePills"

type StatusDatum = {
  key: "approved" | "rejected" | "pending"
  label: string
  value: number
  amount: string
  percentChip: string
  color: string
}

type Props = {
  title?: string
  totalTitle?: string
  totalCount?: number
  totalAmount?: string
  data?: StatusDatum[]
  range?: RangeKey
  onRangeChange?: (v: RangeKey) => void
}

const DEFAULT_DATA: StatusDatum[] = [
  {
    key: "approved",
    label: "Approved",
    value: 8556,
    amount: "₦3,300,000",
    percentChip: "12%",
    color: "#02A32D",
  },
  {
    key: "rejected",
    label: "Rejected",
    value: 1556,
    amount: "₦1,120,000",
    percentChip: "08%",
    color: "#F85E5E",
  },
  {
    key: "pending",
    label: "Pending",
    value: 8556,
    amount: "₦2,040,000",
    percentChip: "10%",
    color: "#F4BF13",
  },
]

export function StatusComparisonCard({
  title = "Status Comparison",
  totalTitle = "Total Claims",
  totalCount = 24_556,
  totalAmount = "₦6,460,000",
  data = DEFAULT_DATA,
  range: rangeProp,
  onRangeChange,
}: Props) {
  const [rangeState, setRangeState] = React.useState<RangeKey>("month")
  const [hidden, setHidden] = React.useState(false)

  const range = rangeProp ?? rangeState
  const setRange = onRangeChange ?? setRangeState

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
            data={data}
            totalTitle={totalTitle}
            totalCount={totalCount}
            totalAmount={totalAmount}
          />
          <StatusLegend data={data} />
        </div>
      )}
    </div>
  )
}
