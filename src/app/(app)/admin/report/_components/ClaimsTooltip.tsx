"use client"

import { cn } from "@/lib/utils"

type Status = "All" | "Approved" | "Pending" | "Rejected"

const DOT: Record<Status, string> = {
  All: "bg-[#02A32D]",
  Approved: "bg-[#02A32D]",
  Pending: "bg-[#F4BF13]",
  Rejected: "bg-[#F85E5E]",
}

export function CustomTooltip({
  month,
  status,
  count,
  amount,
  className,
}: {
  month: string
  status: Status
  count: number
  amount: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "w-[276px] rounded-[6.26px] bg-[#212123]",
        "px-[6.26px] py-[4.7px]",
        className
      )}
    >
      {/* Month */}
      <div className="text-[14px] leading-[100%] font-normal text-[#AFAFAF]">
        {month}
      </div>

      {/* dashed divider */}
      <div className="my-3 border-t border-dashed border-[#3B3B3D]" />

      {/* content row */}
      <div className="flex items-center justify-between gap-4">
        {/* left block */}
        <div className="flex flex-col gap-2">
          {/* status wrapper */}
          <div className="flex items-center gap-2 h-[21px]">
            <span
              className={cn("h-[10px] w-[10px] rounded-full", DOT[status])}
            />
            <span className="text-[14px] leading-[100%] font-normal text-[#AFAFAF]">
              {status} <span className="text-[#AFAFAF]">Claims</span>
            </span>
          </div>

          {/* count */}
          <div className="text-[18px] leading-[100%] font-normal text-[#FCFCFC]">
            {count.toLocaleString("en-US")}
          </div>
        </div>

        {/* amount */}
        <div className="text-[14px] leading-[100%] font-normal text-[#929292]">
          {amount}
        </div>
      </div>
    </div>
  )
}
