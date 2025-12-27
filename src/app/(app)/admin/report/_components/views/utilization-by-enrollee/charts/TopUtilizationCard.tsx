"use client"

import { EyeVisibilityOff } from "@/components/svgs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye } from "lucide-react"
import * as React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import type { RangeKey } from "../../requests-by-provider/StatusRangePills"
import { StatusRangePills } from "../../requests-by-provider/StatusRangePills"

type TopItem = {
  id: string
  name: string
  code?: string
  total: number
  percent: number
  color: string
  avatarUrl?: string
}

function naira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function SmallDot({ color }: { color: string }) {
  return (
    <span className="h-3 w-3 rounded-[4px]" style={{ background: color }} />
  )
}

function PersonTile({ item }: { item: TopItem }) {
  const isOthers = item.id === "others"
  return (
    <div className="h-full rounded-[16px] border border-[#EEF0F5] bg-white p-4 flex flex-col justify-between gap-3">
      <div className="flex items-start gap-3">
        {!isOthers ? (
          <Avatar className="h-12 w-12">
            <AvatarImage src={item.avatarUrl} alt={item.name} />
            <AvatarFallback>{item.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-12 w-12 rounded-full bg-[#F2F4F7]" />
        )}

        <div className="flex-1 flex flex-col">
          <div className="text-[24px] leading-[100%] font-medium text-[#101828]">
            {item.name}
          </div>
          {!!item.code && (
            <div className="text-[16px] leading-5 text-[#475467]">
              {item.code}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="flex items-start gap-[13px]">
          <SmallDot color={item.color} />
          <div className="h-[50px] flex flex-col gap-2">
            <div className="text-[14px] leading-[100%] text-[#535353] tracking-normal">
              Total Utilization
            </div>
            <div className="text-[16px] leading-[100%] font-bold text-[#212123]">
              {naira(item.total)}
            </div>
          </div>
        </div>

        <div
          className="text-[22px] leading-[100%] font-semibold"
          style={{ color: item.color }}
        >
          {item.percent}%
        </div>
      </div>
    </div>
  )
}

export function TopUtilizationCard({
  title = "Top 7 enrollee Utilization",
  range,
  onRangeChange,
  data,
}: {
  title?: string
  data: TopItem[]
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
}) {
  const [hidden, setHidden] = React.useState(false)

  const donutData = React.useMemo(
    () =>
      data.map((d) => ({
        name: d.name,
        value: d.percent,
        color: d.color,
      })),
    [data]
  )

  const rightTiles = data.filter((d) => d.id !== "others")
  const others = data.find((d) => d.id === "others")

  return (
    <div className="w-full bg-white border border-[#EAECF0] flex flex-col gap-8 rounded-[16px] p-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="text-[18px] leading-[100%] font-medium text-[#35404A]">
          {title}
        </div>

        <div className="flex items-center gap-6">
          <StatusRangePills value={range} onChange={onRangeChange} />

          <button
            type="button"
            aria-label={hidden ? "Show" : "Hide"}
            onClick={() => setHidden((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F2F4F7]"
          >
            {hidden ? (
              <Eye className="text-[#939FB3] h-[30px] w-[30px]" />
            ) : (
              <EyeVisibilityOff />
            )}
          </button>
        </div>
      </div>

      {hidden ? (
        <div className="h-[240px] flex items-center justify-center text-[#7A7A7A] text-[14px]">
          Hidden
        </div>
      ) : (
        <div className="grid grid-cols-[420px_1fr] gap-8">
          {/* donut */}
          <div className="bg-white flex items-center justify-center">
            <div className="h-[240px] w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={88}
                    outerRadius={120}
                    startAngle={90}
                    endAngle={-270}
                    stroke="transparent"
                  >
                    {donutData.map((d, idx) => (
                      <Cell key={`data-${idx + 1}`} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* tiles (2 cols like screenshot) */}
          <div className="grid grid-cols-2 gap-6">
            {rightTiles.slice(0, 5).map((it) => (
              <PersonTile key={it.id} item={it} />
            ))}

            {others ? <PersonTile item={others} /> : null}
          </div>
        </div>
      )}
    </div>
  )
}
