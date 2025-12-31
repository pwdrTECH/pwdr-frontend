"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, ArrowUp, ArrowDown } from "lucide-react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { MonthSeries } from "../../views/requests-by-enrollee/types"
import {
  StatusRangePills,
  type RangeKey,
} from "../../views/requests-by-enrollee/StatusRangePills"
import { aggregateSeries } from "../../views/requests-by-enrollee/aggregateSeries"
import { CustomTooltipContent } from "../../ClaimsTooltipContent"
import { EyeVisibilityOff } from "@/components/svgs"

type SeriesKey = "approved" | "pending" | "rejected"

function Square({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-4 w-4 rounded-[4.8px]"
      style={{ background: color }}
    />
  )
}

export function TrendPill({
  value,
  direction,
}: {
  value: string
  direction: "up" | "down"
}) {
  const Icon = direction === "down" ? ArrowDown : ArrowUp

  return (
    <div
      className={cn("flex items-center", "w-[80.1752548px] h-7 gap-[6.26px]")}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center",
          "h-7 w-7 rounded-full shrink-0",
          direction === "down"
            ? "bg-[#FEF3F2] text-[#D71414]"
            : "bg-[#EFF8FF] text-[#1671D9]"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span
        className={cn(
          "text-[18.78px] leading-[100%] font-medium",
          direction === "down" ? "text-[#D71414]" : "text-[#1671D9]"
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function Analytic({
  title,
  value,
  percent,
  dotColor,
  trendDir,
}: {
  title: string
  value: string
  percent: string
  dotColor: string
  trendDir: "up" | "down"
}) {
  return (
    <div className="flex h-[70px] w-[187.175262px] flex-col gap-2">
      <div className="flex h-[21px] items-center gap-2">
        <Square color={dotColor} />
        <div className="text-[14px] leading-[100%] text-[#535353] font-normal">
          {title}
        </div>
      </div>

      <div className="flex h-[41px] items-center justify-between gap-[17px]">
        <div className="text-[28.18px] leading-[100%] font-bold text-[#212123]">
          {value}
        </div>
        <TrendPill value={percent} direction={trendDir} />
      </div>
    </div>
  )
}

/* ---------------- helpers ---------------- */

function toNumber(v: any): number {
  const n =
    typeof v === "number" ? v : Number(String(v ?? "0").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function formatCount(n: number) {
  return n.toLocaleString("en-GB")
}

function formatPct(pct: number) {
  const sign = pct > 0 ? "+" : pct < 0 ? "-" : ""
  return `${sign}${Math.abs(pct).toFixed(1)}%`
}

function trendFromDelta(delta: number): "up" | "down" {
  // treat 0 as up (neutral) so it doesn't look “bad”
  return delta < 0 ? "down" : "up"
}

function computeTrend(chartData: Array<any>, key: SeriesKey) {
  const len = chartData.length
  const last = len >= 1 ? toNumber(chartData[len - 1]?.[key]) : 0
  const prev = len >= 2 ? toNumber(chartData[len - 2]?.[key]) : 0

  const diff = last - prev
  const pct = prev === 0 ? (last === 0 ? 0 : 100) : (diff / prev) * 100

  return {
    value: formatCount(last),
    percent: formatPct(pct),
    trendDir: trendFromDelta(diff),
  }
}

/* ---------------- component ---------------- */

type Props = {
  data: MonthSeries[]
  curveType?: any
  range?: RangeKey
  onRangeChange?: (v: RangeKey) => void
}

export function ClaimsComparisonCard({
  data,
  curveType = "monotone",
  range: rangeProp,
  onRangeChange,
}: Props) {
  const [activeKey, setActiveKey] = React.useState<SeriesKey>("approved")
  const [hidden, setHidden] = React.useState(false)

  const [rangeState, setRangeState] = React.useState<RangeKey>("month")
  const range = rangeProp ?? rangeState
  const setRange = onRangeChange ?? setRangeState

  const chartData = React.useMemo(
    () => aggregateSeries(data, range),
    [data, range]
  )

  // ✅ derive analytics from chartData (deps are correct)
  const analytics = React.useMemo(() => {
    return {
      approved: computeTrend(chartData as any[], "approved"),
      rejected: computeTrend(chartData as any[], "rejected"),
      pending: computeTrend(chartData as any[], "pending"),
    }
  }, [chartData])

  return (
    <div
      className={cn(
        "w-full bg-white border border-[#EAECF0]",
        "rounded-[16px] p-4",
        "h-[550px]"
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="text-[18px] leading-[100%] font-medium text-[#7A7A7A]">
          Claims Comparison
        </div>

        <div className="flex h-[42px] w-[325px] items-center justify-end gap-4">
          <StatusRangePills value={range} onChange={setRange} />

          <button
            type="button"
            aria-label={hidden ? "Show" : "Hide"}
            onClick={() => setHidden((v) => !v)}
            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
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
        <div className="mt-10 h-[440px] flex items-center justify-center text-[#7A7A7A] text-[14px]">
          Hidden
        </div>
      ) : (
        <>
          {/* Analytics row */}
          <div className="mt-6 flex h-[70px] w-full items-start gap-6">
            <div className="flex w-[775.70105px] gap-6">
              <button
                type="button"
                className="text-left"
                onMouseEnter={() => setActiveKey("approved")}
                onFocus={() => setActiveKey("approved")}
              >
                <Analytic
                  title="Approved Claims"
                  value={analytics.approved.value}
                  percent={analytics.approved.percent}
                  dotColor="#02A32D"
                  trendDir={analytics.approved.trendDir}
                />
              </button>

              <button
                type="button"
                className="text-left"
                onMouseEnter={() => setActiveKey("rejected")}
                onFocus={() => setActiveKey("rejected")}
              >
                <Analytic
                  title="Rejected Claims"
                  value={analytics.rejected.value}
                  percent={analytics.rejected.percent}
                  dotColor="#F85E5E"
                  trendDir={analytics.rejected.trendDir}
                />
              </button>

              <button
                type="button"
                className="text-left"
                onMouseEnter={() => setActiveKey("pending")}
                onFocus={() => setActiveKey("pending")}
              >
                <Analytic
                  title="Pending Claims"
                  value={analytics.pending.value}
                  percent={analytics.pending.percent}
                  dotColor="#F4BF13"
                  trendDir={analytics.pending.trendDir}
                />
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-6 h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 12, right: 18, left: 18, bottom: 5 }}
              >
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
                  content={(p) => (
                    <CustomTooltipContent
                      {...(p as any)}
                      activeKey={activeKey}
                    />
                  )}
                />

                <Line
                  type={curveType}
                  dataKey="approved"
                  stroke="#02A32D"
                  strokeWidth={2}
                  dot={false}
                  onMouseEnter={() => setActiveKey("approved")}
                  onMouseMove={() => setActiveKey("approved")}
                  activeDot={{
                    r: 6,
                    strokeWidth: 3,
                    stroke: "#02A32D",
                    fill: "#FFFFFF",
                  }}
                />

                <Line
                  type={curveType}
                  dataKey="pending"
                  stroke="#F4BF13"
                  strokeWidth={2}
                  dot={false}
                  onMouseEnter={() => setActiveKey("pending")}
                  onMouseMove={() => setActiveKey("pending")}
                  activeDot={{
                    r: 6,
                    strokeWidth: 3,
                    stroke: "#F4BF13",
                    fill: "#FFFFFF",
                  }}
                />

                <Line
                  type={curveType}
                  dataKey="rejected"
                  stroke="#F85E5E"
                  strokeWidth={2}
                  dot={false}
                  onMouseEnter={() => setActiveKey("rejected")}
                  onMouseMove={() => setActiveKey("rejected")}
                  activeDot={{
                    r: 6,
                    strokeWidth: 3,
                    stroke: "#F85E5E",
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
