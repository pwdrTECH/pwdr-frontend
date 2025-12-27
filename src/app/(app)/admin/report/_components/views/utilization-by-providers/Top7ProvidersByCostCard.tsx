"use client"

import { EyeVisibilityOff } from "@/components/svgs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"
import {
  type RangeKey,
  StatusRangePills,
} from "../requests-by-provider/StatusRangePills"
import { Square } from "../requests-by-provider/charts/StatusLegend"

type TopDatum = {
  id: string
  label: string
  code: string
  amount: string
  percent: number
  color: string
  logoUrl?: string
}

export function Top7ProvidersByCostCard({
  data,
  range,
  onRangeChange,
}: {
  data: TopDatum[]
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
}) {
  const [hidden, setHidden] = React.useState(false)

  const pieData = React.useMemo(
    () =>
      data.map((d) => ({ name: d.label, value: d.percent, color: d.color })),
    [data]
  )

  return (
    <div
      className={cn(
        "w-full bg-white border border-[#EAECF0] rounded-[16px] p-4"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-[18px] leading-[100%] font-medium text-[#35404A]">
          Top 7 Providers by Cost
        </div>

        <div className="flex items-center gap-6">
          <StatusRangePills value={range} onChange={onRangeChange} />
          <button
            type="button"
            aria-label={hidden ? "Show" : "Hide"}
            onClick={() => setHidden((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
          >
            {hidden ? <Eye className="h-5 w-5" /> : <EyeVisibilityOff />}
          </button>
        </div>
      </div>

      {hidden ? (
        <div className="h-[340px] flex items-center justify-center text-[#7A7A7A] text-[14px]">
          Hidden
        </div>
      ) : (
        <div className="mt-6 flex gap-10">
          {/* donut */}
          <div className="w-[360px] flex items-center justify-center">
            <PieChart width={260} height={260}>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={86}
                outerRadius={120}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {pieData.map((d, i) => (
                  <Cell key={`pie-data${i + 1}`} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </div>

          {/* cards grid */}
          <div className="flex-1 grid grid-cols-2 gap-6">
            {data.map((d) => (
              <div
                key={d.id}
                className="rounded-[16px] border border-[#EAECF0] bg-white p-4 flex flex-col justify-between gap-[13px]"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={d.logoUrl ?? ""} alt={d.label} />
                    <AvatarFallback className="bg-[#EEF2FF] text-[#1671D9]">
                      {d.label.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <div className="text-[16px] font-medium text-[#101828]">
                      {d.label}
                    </div>
                    <div className="text-[16px] font-normal text-[#475467]">
                      {d.code}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-[20px] font-bold text-[#212123]">
                    <Square color={d.color} />
                    {d.amount}
                  </div>
                  <div className="text-[24px] font-bold text-[#1671D9]">
                    {d.percent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
