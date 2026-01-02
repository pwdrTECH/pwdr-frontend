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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  StatusRangePills,
  type RangeKey,
} from "../requests-by-provider/StatusRangePills"
import { Square } from "../requests-by-provider/charts/StatusLegend"

export type TopServiceDatum = {
  key: string
  label: string
  value: number
  percent: number
  color: string
  enrolleeCount: number
}

export type MonthlyServiceCostPoint = {
  m: string // month label
  s1?: number
  s2?: number
  s3?: number
  s4?: number
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
        <Row color="#1671D9" label="Top 1" value={s1} />
        <Row color="#AAB511" label="Top 2" value={s2} />
        <Row color="#D5314D" label="Top 3" value={s3} />
        <Row color="#EAEAEA" label="Others" value={s4} />
      </div>
    </div>
  )
}

function Donut({ data }: { data: TopServiceDatum[] }) {
  const pieData = (data ?? []).map((d) => ({
    name: d.label,
    value: d.value,
    color: d.color,
  }))

  // keep the same proportions; if empty, show nothing
  if (!pieData.length) {
    return <div className="h-[280px] w-[280px] rounded-full bg-[#F2F4F7]" />
  }

  return (
    <div className="h-[280px] w-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={95}
            outerRadius={130}
            stroke="none"
          >
            {pieData.map((entry, idx) => (
              <Cell key={`cell-${idx + 1}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function TopCard({ d }: { d: TopServiceDatum }) {
  return (
    <div className="rounded-[14px] border border-[#EAECF0] bg-white px-6 py-5">
      <div className="flex items-center gap-3">
        <Square color={d.color} />
        <div className="text-[20px]  font-inter font-medium text-[#101828] truncate max-w-[260px]">
          {d.label}
        </div>
      </div>

      <div className="mt-4 text-[14px] text-[#667085]">Enrollees Using</div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-[24px] font-semibold text-[#101828]">
          {fmtInt(d.enrolleeCount ?? 0)}
        </div>
        <div className="text-[18px] font-semibold text-[#1671D9]">
          {Number(d.percent ?? 0)}%
        </div>
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

  // showTop: 3 => a,b,c,others | 2 => a,b,others
  const shownTop = React.useMemo(() => {
    const [a, b, c, others] = top ?? []
    if (showTop === 3)
      return [a, b, c, others].filter(Boolean) as TopServiceDatum[]
    if (showTop === 2)
      return [a, b, others].filter(Boolean) as TopServiceDatum[]
    return (top ?? []).filter(Boolean) as TopServiceDatum[]
  }, [top, showTop])

  return (
    <div
      className={cn(
        "w-full max-w-[1062px] bg-white border border-[#EAECF0]",
        "rounded-[16px] p-6"
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
              // toggles 3 <-> 2 (same as your screenshot behaviour)
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
          {/* Donut + Cards (matches screenshot layout) */}
          <div className="mt-10 flex items-center gap-10">
            <div className="w-[360px] flex items-center justify-center">
              <Donut data={shownTop} />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6">
              {shownTop.map((d) => (
                <TopCard key={d.key} d={d} />
              ))}
            </div>
          </div>

          <div className="mt-12 text-[18px] font-medium text-[#35404A]">
            Monthly Cost on Services
          </div>

          <div className="mt-6 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthly ?? []}
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

                {/* Bars keep same colors as donut */}
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
