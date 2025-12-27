"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Search, ChevronDown } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import {
  type RangeKey,
  StatusRangePills,
} from "../../requests-by-provider/StatusRangePills"
import { Square } from "../../requests-by-provider/charts/StatusLegend"

type TopDatum = {
  key: string
  label: string
  value: number
  percent: number
  color: string
}

type MonthlyPoint = {
  m: string
  s1: number
  s2: number
  s3: number
  s4: number
}

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}

function MiniStatCard({
  label,
  dotColor,
  count,
  percent,
}: {
  label: string
  dotColor: string
  count: number
  percent: number
}) {
  return (
    <div className="flex flex-col justify-between gap-2 w-[313px] h-[132px] rounded-[16px] bg-white p-4 border border-[#EAECF0]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[18.78px] leading-[100%] font-inter font-medium text-[#101828] tracking-[0%]">
            {label}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Square color={dotColor} />{" "}
          <div className="flex flex-col gap-2">
            <div className="text-[18.78px] leading-[100%] font-normal text-[#101828] tracking-[0%]">
              Enrollees involved
            </div>
            <div className="text-[28px] leading-[100%] font-normal text-[#475467]">
              {fmtInt(count)}
            </div>
          </div>
        </div>
        <div className="text-[18px] leading-[100%] font-semibold text-[#1D76D9]">
          {percent}%
        </div>
      </div>
    </div>
  )
}

function Donut({ data }: { data: TopDatum[] }) {
  const total = data.reduce((a, b) => a + (b.value ?? 0), 0)

  return (
    <div className="w-[360px] flex items-center justify-center">
      <div className="relative h-[260px] w-[260px]">
        <PieChart width={260} height={260}>
          <Pie
            data={data}
            dataKey="value"
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

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[12px] text-[#6B7280]">Total</div>
          <div className="text-[22px] font-semibold text-[#111827]">
            {fmtInt(total)}
          </div>
        </div>
      </div>
    </div>
  )
}

function TooltipBox({ month, a, b }: { month: string; a: number; b: number }) {
  return (
    <div className="w-[170px] rounded-[10px] bg-[#212123] px-4 py-3 shadow-lg">
      <div className="text-[14px] leading-[100%] text-[#AFAFAF]">{month}</div>

      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#2563EB]" />
          <div className="text-[14px] leading-[100%] text-[#8C8C8C]">
            Requests
          </div>
        </div>
        <div className="text-[22px] leading-[100%] font-semibold text-white">
          {fmtInt(a)}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="h-3 w-3 rounded-full bg-[#16A34A]" />
          <div className="text-[14px] leading-[100%] text-[#8C8C8C]">
            Claims
          </div>
        </div>
        <div className="text-[22px] leading-[100%] font-semibold text-white">
          {fmtInt(b)}
        </div>
      </div>
    </div>
  )
}

export function DiagnosisLocationInsightsCard({
  title,
  locationLabel,
  range,
  onRangeChange,
  topTitle,
  monthlyTitle,
  top,
  monthly,
}: {
  title: string
  locationLabel: string
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
  topTitle: string
  monthlyTitle: string
  top: TopDatum[]
  monthly: MonthlyPoint[]
}) {
  const [hidden, setHidden] = React.useState(false)

  return (
    <div
      className={cn(
        "w-full max-w-[1062px] bg-white border border-[#EAECF0]",
        "rounded-[16px] p-4 flex flex-col gap-8"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-[18px] leading-[100%] font-medium text-[#35404A]">
            {title}
          </div>

          <button
            type="button"
            className={cn(
              "h-[44px] w-[320px] rounded-[12px] border border-[#0000001A] bg-[#F8F8F8]",
              "px-4 flex items-center justify-between",
              "shadow-[0px_1px_2px_0px_#1018280D]"
            )}
          >
            <span className="flex items-center gap-3  text-[#667085]">
              <Search className="h-5 w-5 text-[#98A2B3]" />
              <span className="text-[16px] leading-[100%] font-normal">
                {locationLabel}
              </span>
            </span>
            <ChevronDown className="h-5 w-5 text-[#667085]" />
          </button>
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
          {/* Top diagnosis section */}
          <div className="font-medium text-[24px] leading-[100%] text-[#7A7A7A]">
            {topTitle}{" "}
            <button
              type="button"
              className="italic text-[24px] leading-[100%] font-medium text-[#383838]"
            >
              - Location Here -
            </button>
          </div>

          <div className="mt-6 flex items-center gap-10">
            <Donut data={top} />

            <div className="flex-1 grid grid-cols-2 gap-6">
              {top.map((d) => (
                <MiniStatCard
                  key={d.key}
                  label={d.label}
                  dotColor={d.color}
                  count={d.value}
                  percent={d.percent}
                />
              ))}
            </div>
          </div>

          {/* Monthly cost bars */}
          <div className="font-medium text-[24px] leading-[100%] text-[#7A7A7A]">
            {monthlyTitle}{" "}
            <button
              type="button"
              className="italic text-[24px] leading-[100%] font-medium text-[#383838]"
            >
              - Location Here -
            </button>
          </div>

          <div className="h-[260px] w-full">
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
                  tick={{ fontSize: 18.78, fill: "#979797" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  tick={{ fontSize: 18.78, fill: "#979797" }}
                  tickFormatter={(v) =>
                    v === 0 ? "0" : `${Math.round(Number(v) / 1000)}k`
                  }
                />

                <Tooltip
                  cursor={{ strokeDasharray: "6 6", stroke: "#BDBDBD" }}
                  content={(p: any) => {
                    if (!p?.active || !p?.payload?.length) return null
                    const row = p.payload[0]?.payload as MonthlyPoint
                    return (
                      <TooltipBox
                        month={String(p.label ?? row.m ?? "")}
                        a={row.s1 ?? 0}
                        b={row.s2 ?? 0}
                      />
                    )
                  }}
                />

                <Bar
                  dataKey="s1"
                  fill="#1671D9"
                  radius={[6, 6, 0, 0]}
                  barSize={10}
                  fillOpacity={0.6}
                />
                <Bar
                  dataKey="s2"
                  fill="#AAB511"
                  radius={[6, 6, 0, 0]}
                  barSize={10}
                  fillOpacity={0.6}
                />
                <Bar
                  dataKey="s3"
                  fill="#D5314D"
                  radius={[6, 6, 0, 0]}
                  barSize={10}
                  fillOpacity={0.6}
                />
                <Bar
                  dataKey="s4"
                  fill="#EAEAEA"
                  radius={[6, 6, 0, 0]}
                  barSize={10}
                  fillOpacity={0.6}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
