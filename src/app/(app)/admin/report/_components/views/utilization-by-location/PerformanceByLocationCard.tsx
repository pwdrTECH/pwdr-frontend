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
  type RangeKey,
  StatusRangePills,
} from "../requests-by-provider/StatusRangePills"
import type { PerfLocationDatum } from "./mock"

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}
function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

type SortKey = "providers" | "enrollees" | "utilization"

function MetricBar({ value, max }: { value: number; max: number }) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max)) // 0..1
  const w = pct * 100

  return (
    <div className="max-w-[453px] relative h-[28px] w-full">
      {/* track */}
      <div className="absolute left-0 top-1/2 h-[4px] w-full -translate-y-1/2 rounded-full bg-[#D5D5D599]" />

      {/* progress */}
      <div
        className="absolute left-0 top-1/2 h-[4px] -translate-y-1/2 bg-[#1671D9]"
        style={{ width: `${w}%` }}
      />

      {/* end-cap (the little vertical marker at the end like figma) */}
      <div
        className="absolute top-1/2 h-[12px] w-[2px] -translate-y-1/2 bg-[#1671D9]"
        style={{ left: `calc(${w}% - 1px)` }}
      />
    </div>
  )
}

export function PerformanceByLocationCard({
  data,
  range,
  onRangeChange,
}: {
  data: PerfLocationDatum[]
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
}) {
  const [hidden, setHidden] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<SortKey>("providers")

  const sorted = React.useMemo(() => {
    const copy = [...data]
    copy.sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0))
    return copy
  }, [data, sortBy])

  // bar width uses selected metric (like your current code)
  const max = React.useMemo(
    () => Math.max(1, ...sorted.map((d) => Number(d[sortBy] ?? 0))),
    [sorted, sortBy]
  )

  return (
    <div
      className={cn(
        "w-full bg-white border border-[#EAECF0]",
        "rounded-[16px] p-4 flex flex-col gap-8"
      )}
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-[18px] leading-[100%] font-medium text-[#35404A]">
            Performance by location
          </div>

          <div className="flex items-center gap-4 h-10 text-[#667085]">
            <span className="text-[16px] text-[#7A7A7A] font-medium tracking-normal">
              Sort by
            </span>

            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortKey)}
            >
              <SelectTrigger
                className={cn(
                  "h-[40px] w-[120px] rounded-[12px] border border-[#EAECF0] bg-white placeholder:text-[#667085]",
                  "px-3 shadow-[0px_1px_2px_0px_#1018280D]"
                )}
              >
                <SelectValue placeholder="Providers" />
              </SelectTrigger>

              <SelectContent className="rounded-[12px]">
                <SelectItem value="providers">Providers</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="enrollees">Enrollees</SelectItem>
                <SelectItem value="utilization">Utilization</SelectItem>
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
        <div className="h-[520px] flex items-center justify-center text-[#7A7A7A] text-[14px]">
          Content is hidden
        </div>
      ) : (
        <div className="w-full">
          {sorted.map((d) => {
            const v = Number(d[sortBy] ?? 0)

            return (
              <div
                key={d.id}
                className="w-full grid grid-cols-[140px_420px_330px] gap-10"
              >
                {/* location */}
                <div className="text-right text-[16px] text-[#979797]">
                  {d.location}
                </div>

                {/* progress */}
                <MetricBar value={v} max={max} />

                {/* right columns */}
                <div className="w-full sm:w-[412px] grid grid-cols-3 gap-[18px]">
                  <div className="flex flex-col">
                    <div className="text-[14px] font-bold text-[#696969] tracking-[0%]">
                      {fmtInt(d.providers)}
                    </div>
                    <div className="text-[14px] font-normal text-[#696969] tracking-[0%]">
                      Providers
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-[14px] font-bold text-[#696969] tracking-[0%]">
                      {fmtInt(d.enrollees)}
                    </div>
                    <div className="text-[14px] font-normal text-[#696969] tracking-[0%]">
                      Enrollees
                    </div>
                  </div>

                  <div className="text-[14px] font-bold text-[#696969] tracking-[0%]">
                    <div className="text-[14px] font-bold text-[#696969] tracking-[0%]">
                      {fmtNaira(d.utilization)}
                    </div>
                    <div className="text-[14px] font-normal text-[#696969] tracking-[0%]">
                      Utilization
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
