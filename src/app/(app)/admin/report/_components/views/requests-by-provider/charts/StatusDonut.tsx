"use client"

import * as React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import type { StatusDatum } from "./StatusComparisonCard"

type Props = {
  data: StatusDatum[]
  totalTitle?: string
  totalCount?: number
  totalAmount?: string
}

export function StatusDonut({ data }: Props) {
  const chartData = React.useMemo(() => {
    return (data ?? []).map((d) => ({
      name: d.label,
      value: Number(d.value ?? 0),
      color: d.color,
    }))
  }, [data])
  console.log(chartData, "chartData")
  return (
    <div className="w-[240px] h-[240px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={78}
            outerRadius={115}
            paddingAngle={0}
            stroke="none"
            isAnimationActive={false}
          >
            {chartData.map((entry, idx) => (
              <Cell key={`cell-${idx + 1}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
