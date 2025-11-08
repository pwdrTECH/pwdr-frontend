"use client"
import { Card } from "@/components/ui/card"

export function ProfileStats() {
  const stats = [
    { label: "Premium:", value: "N300,000" },
    { label: "Benefit", value: "N850,000" },
    { label: "Utilization", value: "32%", isGreen: true },
    { label: "Balance left", value: "N578,000" },
  ]

  return (
    <div className="w-full max-w-[768px] flex gap-2 rounded-3xl p-2 border border-[#EAECF0]">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 w-[182px] h-[82px] py-[15px] px-[17px] font-hnd font-normal"
          >
            <p className="text-[#475467] text-[14px]/[20px]">{stat.label}</p>
            <p
              className={`text-[20px]/[20px] text-[#3F3F3F] font-bold ${
                stat.isGreen ? "text-[#4AA802]" : "text-[#3F3F3F]"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
