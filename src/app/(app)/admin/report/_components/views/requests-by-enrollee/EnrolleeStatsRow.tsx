"use client"

import { cn } from "@/lib/utils"

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[12px]/[18px] text-[#667085]">{label}</div>
      <div
        className={cn(
          "text-[20px]/[28px] font-semibold text-[#101828]",
          valueClassName
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function EnrolleeStatsRow() {
  return (
    <div className="w-full border-b border-[#EEF0F5] px-6 py-8">
      <div className="grid grid-cols-5 gap-8">
        <Stat label="Total Enrollee" value="263" />
        <Stat label="Total claims" value="₦ 25,748,801" />
        <Stat label="Approved claims" value="₦ 25,748,801" />
        <Stat
          label="Rejected claims"
          value="₦ 3,748,801"
          valueClassName="text-[#F04438]"
        />
        <Stat label="Pending Claims" value="₦ 5,834,841" />
      </div>
    </div>
  )
}
