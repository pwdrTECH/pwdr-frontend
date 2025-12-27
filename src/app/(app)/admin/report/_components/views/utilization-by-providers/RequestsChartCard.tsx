"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Eye, EyeOff, Search } from "lucide-react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import {
  type RangeKey,
  StatusRangePills,
} from "../requests-by-provider/StatusRangePills"
import { TrendPill } from "../../reports/chart/ClaimsComparisonCard"
import { Square } from "../requests-by-provider/charts/StatusLegend"

type Point = { m: string; requests: number }

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}

function TooltipBox({ month, requests }: { month: string; requests: number }) {
  return (
    <div className="w-[220px] rounded-[10px] bg-[#212123] px-4 py-3 shadow-lg">
      <div className="text-[14px] leading-[100%] text-[#AFAFAF]">{month}</div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#1671D9]" />
          <div className="text-[14px] leading-[100%] text-[#8C8C8C]">
            Requests
          </div>
        </div>
        <div className="text-[14px] text-[#8C8C8C]">₦ 93,390,283.29</div>
      </div>

      <div className="mt-2 text-[22px] leading-[100%] font-semibold text-white">
        {fmtInt(requests)}
      </div>
    </div>
  )
}

export function RequestsChartCard({
  data,
  range,
  onRangeChange,
}: {
  data: Point[]
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
}) {
  const [hidden, setHidden] = React.useState(false)

  const total = React.useMemo(
    () => data.reduce((a, b) => a + (b.requests ?? 0), 0),
    [data]
  )

  return (
    <div
      className={cn(
        "w-full bg-white border border-[#EAECF0] rounded-[16px] p-4 flex flex-col gap-8"
      )}
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-[18px] leading-[100%] font-medium text-[#35404A]">
            Requests Chart
          </div>

          {/* provider dropdown pill (visual only) */}
          <button
            type="button"
            className={cn(
              "h-[40px] w-[300px] rounded-[12px] border border-[#0000001A] bg-[#F8F8F8]",
              "px-3 flex items-center justify-between shadow-[0px_1px_2px_0px_#1018280D]"
            )}
          >
            <span className="flex items-center gap-2 text-[14px] text-[#667085]">
              <Search className="h-4 w-4 text-[#98A2B3]" />
              Search/ Select Provider - All
            </span>
            <ChevronDown className="h-4 w-4 text-[#667085]" />
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
        <div className="h-[240px] flex items-center justify-center text-[#7A7A7A] text-[14px]">
          Hidden
        </div>
      ) : (
        <>
          {/* small legend row like screenshot */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Square color="#1671D9B2" />
              <div className="text-[14px] leading-[100%] text-[#535353]">
                Requests this month
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[28.18px] font-bold text-[#212123] tracking-normal">
                {fmtInt(total)}
              </div>
              <TrendPill value="+5.2%" direction="up" />
            </div>
          </div>

          <div className="mt-6 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 8, right: 14, left: 14, bottom: 8 }}
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
                  cursor={{ strokeDasharray: "6 6", stroke: "#D0D5DD" }}
                  content={(p: any) => {
                    if (!p?.active || !p?.payload?.length) return null
                    const row = p.payload[0]?.payload as Point
                    return (
                      <TooltipBox
                        month={String(p.label ?? row.m ?? "")}
                        requests={row.requests ?? 0}
                      />
                    )
                  }}
                />

                <Line
                  type="linear"
                  dataKey="requests"
                  stroke="#1671D9"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 3,
                    stroke: "#1671D9",
                    fill: "#FFFFFF",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
