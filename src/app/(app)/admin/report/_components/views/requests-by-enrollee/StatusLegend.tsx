"use client"

import { cn } from "@/lib/utils"

type StatusDatum = {
  key: "approved" | "rejected" | "pending"
  label: string
  value: number
  amount: string
  percentChip: string
  color: string
}

function Square({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-[4.8px]"
      style={{ background: color }}
    />
  )
}

export function StatusLegend({ data }: { data: StatusDatum[] }) {
  return (
    <div className="flex w-[509px] h-[120px] flex-col gap-6">
      {data.map((d) => (
        <div
          key={d.key}
          className="flex w-[238px] h-6 items-center justify-between gap-6"
        >
          {/* square + title */}
          <div className="flex w-[134px] h-[21px] items-center gap-2">
            <Square color={d.color} />
            <span className="text-[14px] leading-[100%] font-normal text-[#535353]">
              {d.label}
            </span>
          </div>

          {/* amount + percent chip */}
          <div className="flex w-[104px] h-6 items-center gap-[17px]">
            <span className="text-[16px] leading-[100%] font-bold text-[#212123]">
              {d.value.toLocaleString("en-US")}
            </span>

            <span
              className={cn(
                "inline-flex items-center justify-center",
                "w-[44px] h-[21px] rounded-[6px]",
                "border border-[#E1E1E1] bg-[#52525212]",
                "px-[7px]"
              )}
            >
              <span className="text-[14px] leading-[100%] font-medium text-[#464646]">
                {d.percentChip}
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
