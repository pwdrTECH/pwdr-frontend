"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  [scheme: string]: number | string
}

type SortKey = "__enrollees__" | "__cost__" | "__requests__"

const COLORS = ["#1671D9", "#02A32D", "#F4BF13", "#F85E5E", "#7A5AF8"]

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}

function TooltipBox({
  month,
  values,
}: {
  month: string
  values: { key: string; value: number; color: string }[]
}) {
  return (
    <div className="w-[200px] rounded-[10px] bg-[#212123] px-4 py-3 shadow-lg">
      <div className="text-[14px] text-[#AFAFAF]">{month}</div>

      <div className="mt-3 flex flex-col gap-3">
        {values.map((v) => (
          <div key={v.key}>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: v.color }}
              />
              <div className="text-[14px] text-[#8C8C8C]">
                {v.key.toUpperCase()}
              </div>
            </div>
            <div className="text-[20px] font-semibold text-white">
              {fmtInt(v.value)}
            </div>
          </div>
        ))}
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

  // derive scheme keys dynamically (exclude "m")
  const schemeKeys = React.useMemo(() => {
    if (!data.length) return []
    return Object.keys(data[0]).filter((k) => k !== "m")
  }, [data])

  return (
    <div className="w-full bg-white border border-[#EAECF0] rounded-[16px] p-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-[18px] font-medium text-[#35404A]">
            Top Schemes
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[14px] text-[#667085]">Sort by</div>

            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortKey)}
            >
              <SelectTrigger className="h-[40px] w-[160px] rounded-[12px] border border-[#EAECF0] bg-[#F8F8F8]">
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
            onClick={() => setHidden((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
          >
            {hidden ? <Eye /> : <EyeOff />}
          </button>
        </div>
      </div>

      {hidden ? (
        <div className="h-[280px] flex items-center justify-center text-[#7A7A7A]">
          Hidden
        </div>
      ) : (
        <div className="mt-6 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                vertical={false}
                stroke="#D0D5DD"
                strokeDasharray="6 6"
              />

              <XAxis
                dataKey="m"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: "#979797" }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 14, fill: "#979797" }}
                tickFormatter={(v) =>
                  v === 0 ? "0" : `${Math.round(Number(v) / 1000)}k`
                }
              />

              <Tooltip
                content={(p: any) => {
                  if (!p?.active || !p?.payload?.length) return null
                  const row = p.payload[0].payload as Point

                  const values = schemeKeys.map((k, i) => ({
                    key: k,
                    value: Number(row[k] ?? 0),
                    color: COLORS[i % COLORS.length],
                  }))

                  return <TooltipBox month={String(row.m)} values={values} />
                }}
              />

              {schemeKeys.map((k, i) => (
                <Line
                  key={k}
                  type="linear"
                  dataKey={k}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 3,
                    stroke: COLORS[i % COLORS.length],
                    fill: "#FFFFFF",
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
