"use client"

import { ArrowUp } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowDown, MoreHorizontal } from "lucide-react"
import React from "react"
import { AvgClaimsMiniChart } from "./AvgClaimsMiniChart"
import { ClaimsAreaChart } from "./ClaimsAreaChart"
export type DashboardFilters = {
  q: string
  period: "this-month" | "last-3" | "last-6" | "last-12"
  status: "all" | "approved" | "queried" | "unattended"
  hmos: string[] // slugs
}

const HMO_OPTIONS = [
  { label: "Apex Health", value: "apex" },
  { label: "ZenCare", value: "zencare" },
  { label: "MedicPlus", value: "medicplus" },
  { label: "BluePeak", value: "bluepeak" },
]

type Props = {
  defaultValue?: Partial<DashboardFilters>
  onApply: (filters: DashboardFilters) => void
  onClear?: () => void
}

export function ChartCard() {
  const [local, setLocal] = React.useState<DashboardFilters>({
    q: "",
    period: "this-month",
    status: "all",
    hmos: [],
  })

  function toggleHmo(v: string) {
    setLocal((prev) => {
      const exists = prev.hmos.includes(v)
      return {
        ...prev,
        hmos: exists ? prev.hmos.filter((x) => x !== v) : [...prev.hmos, v],
      }
    })
  }

  return (
    <Card className="border-[#EAECF0] shadow-none rounded-[12px]">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-[12px]">
            <p className="text-[14px] leading-[100%] tracking-normal font-hnd font-medium text-[#7A7A7A]">
              Claims by Period
            </p>
            <Select
              value={local.period}
              onValueChange={(v: DashboardFilters["period"]) =>
                setLocal((s) => ({ ...s, period: v }))
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-3">Last 3 Months</SelectItem>
                <SelectItem value="last-6">Last 6 Months</SelectItem>
                <SelectItem value="last-12">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-hnd text-[28.18px] leading-[100%] tracking-normal text-[#212123] font-bold">
              4,556
            </span>
            <div className="h-[28px] flex items-center gap-[6.26px]">
              <div className="w-[21.9px] h-[21.9px] rounded-full bg-[#22D188]/40 text-[#14A166] flex justify-center items-center">
                <ArrowUp className="w-[18.78px] h-[18.78px]" />
              </div>
              <div className="font-hnd font-medium text-[18.78px] leading-[100%] tracking-normal text-[#14A166]">
                +5.2%
              </div>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#7A7A7A] hover:bg-primary/5 cursor-pointer"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-4 sm:px-4">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_220px]">
          <ClaimsAreaChart />

          <div className="flex flex-col justify-between py-6 px-2 rounded-[12px] bg-[#027FA30F]">
            <div className="flex flex-col gap-3 justify-center items-center">
              <p className="text-[12px] text-[#6B7280]">Average Claims</p>
              <p className="mt-3 text-2xl font-semibold">4,556</p>
            </div>
            <div className="mt-3">
              <AvgClaimsMiniChart />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
