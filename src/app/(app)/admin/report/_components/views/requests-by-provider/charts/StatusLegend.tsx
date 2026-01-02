"use client"

import type { StatusDatum } from "./StatusComparisonCard"

type Props = {
  data: StatusDatum[]
}

export function Square({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-[4px] shrink-0"
      style={{ background: color }}
    />
  )
}

export function StatusLegend({ data }: Props) {
  return (
    <div className="w-full xl:w-[648px] h-[120px] grid grid-cols-2 gap-[22px]">
      {(data ?? []).map((d) => (
        <div
          key={d.key}
          className="flex flex-col justify-between gap-2 w-[313px] h-[132px] rounded-[16px] bg-white p-4 border border-[#EAECF0]"
        >
          {/* title row */}
          <div className="flex items-center gap-2">
            <Square color={d.color} />
            <div className="text-[18.78px] leading-[100%] font-normal text-black tracking-[0%]">
              {d.label}
            </div>
          </div>
          {/* stats: No. row */}
          <div className="flex items-center justify-between">
            <div className="text-[18.78px] leading-[100%] font-normal text-[#101828] tracking-[0%]">
              No.
            </div>
            <div className="text-[28px] leading-[100%] font-normal text-[#475467]">
              {Number(d.value ?? 0).toLocaleString("en-US")}
            </div>
          </div>
          {/* stats: Cost row  */}
          <div className="flex items-center justify-between">
            <div className="text-[18.78px] leading-[100%] font-normal text-[#101828] tracking-[0%]">
              Cost
            </div>
            <div className="text-[18.78px] leading-[100%] font-normal text-[#475467] tracking-[0%]">
              {d.amount}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
