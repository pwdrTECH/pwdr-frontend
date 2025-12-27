"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

type StatusDatum = {
  key: "approved" | "rejected" | "pending"
  label: string
  value: number
  amount: string
  percentChip: string
  color: string
}

type Props = {
  data: StatusDatum[]
  totalTitle: string
  totalCount: number
  totalAmount: string
}

export function StatusDonut({
  data,
  totalTitle,
  totalCount,
  totalAmount,
}: Props) {
  // Rotate -180deg like your spec by rotating container
  return (
    <div className="w-[240px] h-[240px] rotate-180">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={78}
            outerRadius={120}
            stroke="transparent"
            startAngle={90}
            endAngle={-270}
            paddingAngle={2}
          >
            {data.map((d) => (
              <Cell key={d.key} fill={d.color} />
            ))}
          </Pie>

          {/* Center labels (counter-rotate text so it reads normally) */}
          <foreignObject x="0" y="0" width="240" height="240">
            <div className="w-[240px] h-[240px] flex items-center justify-center rotate-180">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="text-[16px] leading-[100%] font-normal text-[#696969]">
                  {totalTitle}
                </div>
                <div className="text-[24px] leading-[100%] font-normal text-[#212123]">
                  {totalCount.toLocaleString("en-US")}
                </div>
                <div className="text-[14px] leading-[100%] font-normal text-[#535353]">
                  {totalAmount}
                </div>
              </div>
            </div>
          </foreignObject>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
