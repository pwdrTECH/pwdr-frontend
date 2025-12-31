"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, ChevronDown } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  StatusRangePills,
  type RangeKey,
} from "../requests-by-provider/StatusRangePills"

export type TopServiceDatum = {
  key: string
  label: string
  value: number
  percent: number
  color: string
}

export type MonthlyServiceCostPoint = {
  m: string // month label
  s1?: number // inpatient
  s2?: number // outpatient
  s3?: number // pharmacy
  s4?: number // others
}

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}

function TooltipBox({
  month,
  s1,
  s2,
  s3,
  s4,
}: {
  month: string
  s1: number
  s2: number
  s3: number
  s4: number
}) {
  const Row = ({
    color,
    label,
    value,
  }: {
    color: string
    label: string
    value: number
  }) => (
    <div className="flex items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
        <div className="text-[12px] text-[#8C8C8C]">{label}</div>
      </div>
      <div className="text-[16px] font-semibold text-white">
        {fmtInt(value)}
      </div>
    </div>
  )

  return (
    <div className="w-[210px] rounded-[10px] bg-[#212123] px-4 py-3 shadow-lg">
      <div className="text-[14px] text-[#AFAFAF]">{month}</div>
      <div className="mt-3 flex flex-col gap-3">
        <Row color="#1671D9" label="Inpatient" value={s1} />
        <Row color="#AAB511" label="Outpatient" value={s2} />
        <Row color="#D5314D" label="Pharmacy" value={s3} />
        <Row color="#EAEAEA" label="Others" value={s4} />
      </div>
    </div>
  )
}

export function ServiceInsightsCard({
  range,
  onRangeChange,
  top,
  monthly,
}: {
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
  top: TopServiceDatum[]
  monthly: MonthlyServiceCostPoint[]
}) {
  const [hidden, setHidden] = React.useState(false)
  const [showTop, setShowTop] = React.useState(3)

  const shownTop = React.useMemo(() => {
    const [a, b, c, others] = top
    if (showTop === 3) return [a, b, c, others].filter(Boolean)
    if (showTop === 2) return [a, b, others].filter(Boolean)
    return top
  }, [top, showTop])

  return (
    <div
      className={cn(
        "w-full max-w-[1062px] bg-white border border-[#EAECF0]",
        "rounded-[16px] p-4"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-[18px] leading-[100%] font-medium text-[#35404A]">
            Top Services
          </div>

          <div className="flex items-center gap-3 text-[#667085]">
            <span className="text-[14px]">Show Top</span>

            <button
              type="button"
              className={cn(
                "h-[40px] w-[74px] rounded-[12px] border border-[#EAECF0] bg-white",
                "px-3 flex items-center justify-between shadow-[0px_1px_2px_0px_#1018280D]"
              )}
              onClick={() => setShowTop((v) => (v === 3 ? 2 : 3))}
            >
              <span className="text-[14px] text-[#111827]">{showTop}</span>
              <ChevronDown className="h-4 w-4 text-[#667085]" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <StatusRangePills value={range} onChange={onRangeChange} />
          <button
            type="button"
            aria-label={hidden ? "Show" : "Hide"}
            onClick={() => setHidden((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
          >
            {hidden ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {hidden ? (
        <div className="h-[520px] flex items-center justify-center text-[#7A7A7A] text-[14px]">
          Content is hidden
        </div>
      ) : (
        <>
          {/* (Your donut/cards are currently commented out — leaving as-is) */}
          <div className="mt-8 flex items-center gap-10">
            <div className="w-[360px] flex items-center justify-center" />
            <div className="flex-1 grid grid-cols-2 gap-6">
              {shownTop.map((_, i) => (
                <React.Fragment key={`top-${i + 1}`} />
              ))}
            </div>
          </div>

          <div className="mt-10 text-[18px] font-medium text-[#35404A]">
            Monthly Cost on Services
          </div>

          <div className="mt-6 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthly}
                margin={{ top: 10, right: 16, left: 16, bottom: 10 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#D0D5DD"
                  strokeDasharray="6 6"
                />
                <XAxis
                  dataKey="m"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  tick={{ fontSize: 18, fill: "#979797" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  tick={{ fontSize: 18, fill: "#979797" }}
                  tickFormatter={(v) =>
                    v === 0 ? "0" : `${Math.round(Number(v) / 1000)}k`
                  }
                />

                <Tooltip
                  cursor={{ strokeDasharray: "6 6", stroke: "#BDBDBD" }}
                  content={(p: any) => {
                    if (!p?.active || !p?.payload?.length) return null
                    const row = p.payload[0]?.payload as MonthlyServiceCostPoint
                    return (
                      <TooltipBox
                        month={String(p.label ?? row.m ?? "")}
                        s1={row.s1 ?? 0}
                        s2={row.s2 ?? 0}
                        s3={row.s3 ?? 0}
                        s4={row.s4 ?? 0}
                      />
                    )
                  }}
                />

                <Bar
                  dataKey="s1"
                  fill="#1671D9"
                  fillOpacity={0.6}
                  radius={[6, 6, 0, 0]}
                  barSize={10}
                />
                <Bar
                  dataKey="s2"
                  fill="#AAB511"
                  fillOpacity={0.6}
                  radius={[6, 6, 0, 0]}
                  barSize={10}
                />
                <Bar
                  dataKey="s3"
                  fill="#D5314D"
                  fillOpacity={0.6}
                  radius={[6, 6, 0, 0]}
                  barSize={10}
                />
                <Bar
                  dataKey="s4"
                  fill="#EAEAEA"
                  fillOpacity={0.9}
                  radius={[6, 6, 0, 0]}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
