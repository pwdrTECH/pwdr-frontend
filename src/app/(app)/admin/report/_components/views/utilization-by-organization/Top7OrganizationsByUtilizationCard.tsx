"use client"

import { EyeVisibilityOff } from "@/components/svgs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import * as React from "react"
import { Cell, Pie, PieChart } from "recharts"
import { Square } from "../requests-by-provider/charts/StatusLegend"
import {
  StatusRangePills,
  type RangeKey,
} from "../requests-by-provider/StatusRangePills"
import type { TopOrgDatum } from "./mock"

function Donut({ data }: { data: TopOrgDatum[] }) {
  return (
    <div className="w-[360px] flex items-center justify-center">
      <div className="relative h-[260px] w-[260px]">
        <PieChart width={260} height={260}>
          <Pie
            data={data}
            dataKey="percent"
            nameKey="label"
            innerRadius={86}
            outerRadius={120}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
    </div>
  )
}

function OrgCard({ d }: { d: TopOrgDatum }) {
  return (
    <div className="w-full rounded-[16px] border border-[#EAECF0] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {d.logoUrl ? <AvatarImage src={d.logoUrl} alt={d.label} /> : null}
            <AvatarFallback className="text-[12px] bg-[#F2F4F7] text-[#344054]">
              {d.label?.slice(0, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <div className="text-[16px] font-medium text-[#101828] leading-[100%]">
              {d.label}
            </div>
            <div className="text-[16px] text-[#475467] leading-[20px]">
              13/O/W7E270
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex justify-between mt-4">
        <div className="flex items-center gap-4">
          <Square color={d.color} />
          <div className="flex flex-col">
            <div className="text-[14px] text-[#535353] leading-[100%]">
              Total Utilization
            </div>
            <div className="text-[20px] font-bold text-[#212123] leading-[100%]">
              {d.amount}
            </div>
          </div>
        </div>

        <div className="flex flex-end text-[20px] font-semibold text-[#1D76D9]">
          {d.percent}%
        </div>
      </div>
    </div>
  )
}

export function Top7OrganizationsByUtilizationCard({
  data,
  range,
  onRangeChange,
}: {
  data: TopOrgDatum[]
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
}) {
  const [hidden, setHidden] = React.useState(false)

  return (
    <div
      className={cn(
        "w-full bg-white border border-[#EAECF0]",
        "rounded-[16px] p-4"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-[18px] leading-[100%] font-medium text-[#35404A]">
          Top 7 Organization by Utilization
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
          Content is hidden
        </div>
      ) : (
        <div className="mt-6 flex gap-8">
          <Donut data={data} />

          <div className="flex-1 grid grid-cols-2 gap-6">
            {data.map((d) => (
              <OrgCard key={d.key} d={d} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
