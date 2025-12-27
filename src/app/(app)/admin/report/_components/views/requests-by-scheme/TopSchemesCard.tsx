"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"
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
import {
  type RangeKey,
  StatusRangePills,
} from "../requests-by-provider/StatusRangePills"

type Point = {
  m: string
  tship: number
  nhis: number
}

type SortKey = "__enrollees__" | "__cost__" | "__requests__"

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}

function TooltipBox({
  month,
  tship,
  nhis,
}: {
  month: string
  tship: number
  nhis: number
}) {
  return (
    <div className="w-[170px] rounded-[10px] bg-[#212123] px-4 py-3 shadow-lg">
      <div className="text-[14px] leading-[100%] text-[#AFAFAF]">{month}</div>

      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#1671D9]" />
          <div className="text-[14px] leading-[100%] text-[#8C8C8C]">TSHIP</div>
        </div>
        <div className="text-[22px] leading-[100%] font-semibold text-white">
          {fmtInt(tship)}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="h-3 w-3 rounded-full bg-[#02A32D]" />
          <div className="text-[14px] leading-[100%] text-[#8C8C8C]">NHIS</div>
        </div>
        <div className="text-[22px] leading-[100%] font-semibold text-white">
          {fmtInt(nhis)}
        </div>
      </div>
    </div>
  )
}

export function TopSchemesCard({
  data,
  range,
  onRangeChange,
}: {
  data: Point[]
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
}) {
  const [hidden, setHidden] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<SortKey>("__enrollees__")

  return (
    <div
      className={cn(
        "w-full bg-white border border-[#EAECF0] rounded-[16px] p-4"
      )}
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-[18px] leading-[100%] font-medium text-[#35404A]">
            Top Schemes
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[14px] text-[#667085]">Sort by</div>

            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortKey)}
            >
              <SelectTrigger
                className={cn(
                  "h-[40px] w-[160px] rounded-[12px] text-[14px] text-[#667085]",
                  "border border-[#EAECF0] bg-[#F8F8F8]",
                  "shadow-[0px_1px_2px_0px_#1018280D]"
                )}
              >
                <SelectValue placeholder="No of Enrollees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__enrollees__">No of Enrollees</SelectItem>
                <SelectItem value="__cost__">Cost</SelectItem>
                <SelectItem value="__requests__">Requests</SelectItem>
              </SelectContent>
            </Select>
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
        <div className="h-[280px] flex items-center justify-center text-[#7A7A7A] text-[14px]">
          Hidden
        </div>
      ) : (
        <div className="mt-6 h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 14, left: 14, bottom: 6 }}
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
                tickMargin={14}
                tick={{ fontSize: 14, fill: "#979797" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={14}
                tick={{ fontSize: 14, fill: "#979797" }}
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
                      tship={row.tship ?? 0}
                      nhis={row.nhis ?? 0}
                    />
                  )
                }}
              />

              {/* blue */}
              <Line
                type="linear"
                dataKey="tship"
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

              {/* green */}
              <Line
                type="linear"
                dataKey="nhis"
                stroke="#02A32D"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 3,
                  stroke: "#02A32D",
                  fill: "#FFFFFF",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
