"use client"

import { EyeVisibilityOff } from "@/components/svgs"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import * as React from "react"
import {
  type RangeKey,
  StatusRangePills,
} from "../requests-by-provider/StatusRangePills"

type Row = { id: string; provider: string; value: number }

export function ServicesOfferedByProvidersCard({
  data,
  range,
  onRangeChange,
}: {
  data: Row[]
  range: RangeKey
  onRangeChange: (v: RangeKey) => void
}) {
  const [hidden, setHidden] = React.useState(false)
  const max = React.useMemo(
    () => Math.max(1, ...data.map((d) => d.value)),
    [data]
  )

  return (
    <div
      className={cn(
        "w-full bg-white border border-[#EAECF0] rounded-[16px] p-4 flex flex-col gap-8"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-[18px] leading-[100%] font-medium text-[#35404A]">
          Services offered by Providers
        </div>

        <div className="flex items-center gap-6">
          <StatusRangePills value={range} onChange={onRangeChange} />
          <button
            type="button"
            aria-label={hidden ? "Show" : "Hide"}
            onClick={() => setHidden((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#667085] hover:bg-[#F2F4F7]"
          >
            {hidden ? <Eye className="h-5 w-5" /> : <EyeVisibilityOff />}
          </button>
        </div>
      </div>

      {hidden ? (
        <div className="h-[220px] flex items-center justify-center text-[#7A7A7A] text-[14px]">
          Hidden
        </div>
      ) : (
        <div className="space-y-4">
          {/* top axis numbers vibe (0..55) — visual only */}
          <div className="flex justify-between text-[18.78px] text-[#979797] leading-[100%] pr-[18px] pl-[143px]">
            {[
              "0",
              "5",
              "10",
              "15",
              "20",
              "25",
              "30",
              "35",
              "40",
              "45",
              "50",
              "55",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>

          {data.map((d) => {
            const pct = Math.max(6, Math.round((d.value / max) * 100))
            return (
              <div
                key={d.id}
                className="grid grid-cols-[130px_1fr] items-center gap-4"
              >
                <div className="text-[18.78px] leading-[100%] text-[#979797] justify-between">
                  {d.provider}
                </div>

                <div className="h-[10px] rounded-full bg-[#EAEAEA] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1671D9]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
