"use client"

import { ArrowUp, EyeVisibilityOff } from "@/components/svgs"
import { cn } from "@/lib/utils"
import { ChevronDown, Eye, Search } from "lucide-react"
import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { type RangeKey, StatusRangePills } from "../StatusRangePills"

type ProviderSeriesPoint = {
  m: string
  requests: number
  cost: number
}

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}

/** Blue circular arrow + percent text like the screenshot */
function TrendUp({ value = "+5.2%" }: { value?: string }) {
  return (
    <div className="flex items-center gap-[6.26px]">
      <span className="inline-flex h-[21.9px] w-[21.9px] items-center justify-center rounded-full bg-[#EAF2FF] text-[#1671D9]">
        <ArrowUp />
      </span>
      <span className="text-[18.87px] leading-[100%] font-medium text-[#1671D9]">
        {value}
      </span>
    </div>
  )
}

function Metric({
  label,
  value,
  trend = "+5.2%",
}: {
  label: string
  value: string
  trend?: string
}) {
  return (
    <div className="h-[62px] flex flex-col gap-4">
      <div className="text-[14px] leading-[100%] font-normal text-[#535353]">
        {label}
      </div>

      <div className="flex items-center gap-[17px]">
        <div className="text-[28.18px] leading-[100%] font-bold text-[#212123]">
          {value}
        </div>
        <TrendUp value={trend} />
      </div>
    </div>
  )
}

function TooltipBox({
  month,
  requests,
  cost,
}: {
  month: string
  requests: number
  cost: number
}) {
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
          {fmtInt(requests)}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="h-3 w-3 rounded-full bg-[#16A34A]" />
          <div className="text-[14px] leading-[100%] text-[#8C8C8C]">Cost</div>
        </div>
        <div className="text-[22px] leading-[100%] font-semibold text-white">
          {fmtInt(cost)}
        </div>
      </div>
    </div>
  )
}

export function MonthlyRequestsCostsCard({
  providerLabel = "Search/ Select Provider - All",
  range,
  onRangeChange,
  data,
}: {
  providerLabel?: string
  data: ProviderSeriesPoint[]
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
}) {
  const [hidden, setHidden] = React.useState(false)

  const totals = React.useMemo(() => {
    const visits = data.reduce((a, b) => a + (b.requests ?? 0), 0)
    const cost = data.reduce((a, b) => a + (b.cost ?? 0), 0)
    return { visits, cost }
  }, [data])

  return (
    <div
      className={cn(
        "w-full  bg-white border border-[#EAECF0]",
        "rounded-[16px] p-4",
        "h-[550px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-[18px] leading-[100%] font-medium text-[#7A7A7A]">
            Monthly Requests &amp; Costs
          </div>

          <button
            type="button"
            className={cn(
              "h-[44px] w-[420px] rounded-[12px] border border-[#EAECF0] bg-white",
              "px-4 flex items-center justify-between",
              "shadow-[0px_1px_2px_0px_#1018280D]"
            )}
            aria-label="Select Provider"
          >
            <span className="flex items-center gap-3 text-[#667085]">
              <Search className="h-5 w-5 text-[#98A2B3]" />
              <span className="text-[16px] leading-[100%] font-normal">
                {providerLabel}
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7] cursor-pointer"
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
          Content hidden
        </div>
      ) : (
        <>
          {/* Metrics row */}
          <div className="mt-10 flex items-start gap-[120px]">
            <Metric
              label="Visits"
              value={fmtInt(totals.visits)}
              trend="+5.2%"
            />
            <Metric label="Cost" value={fmtNaira(totals.cost)} trend="+5.2%" />
          </div>

          {/* Chart */}
          <div className="mt-10 h-[330px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 18, left: 18, bottom: 10 }}
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
                  tickMargin={18}
                  tick={{ fontSize: 18.78, fill: "#979797" }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={18}
                  tick={{ fontSize: 18.78, fill: "#979797" }}
                  tickFormatter={(v) =>
                    v === 0 ? "0" : `${Math.round(v / 1000)}k`
                  }
                />

                <Tooltip
                  cursor={{ strokeDasharray: "6 6", stroke: "#BDBDBD" }}
                  content={(p: any) => {
                    if (!p?.active || !p?.payload?.length) return null
                    const row = p.payload[0]?.payload as ProviderSeriesPoint
                    return (
                      <TooltipBox
                        month={String(p.label ?? row.m ?? "")}
                        requests={row.requests ?? 0}
                        cost={row.cost ?? 0}
                      />
                    )
                  }}
                />

                {/* SHARP / TRIANGULAR edges: type="linear" */}
                <Line
                  type="linear"
                  dataKey="requests"
                  stroke="#1671D9"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    strokeWidth: 4,
                    stroke: "#1671D9",
                    fill: "#FFFFFF",
                  }}
                />

                <Line
                  type="linear"
                  dataKey="cost"
                  stroke="#02A32D"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    strokeWidth: 4,
                    stroke: "#02A32D",
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
