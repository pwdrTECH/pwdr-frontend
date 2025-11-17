"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as React from "react"

type KpiCardProps = {
  title: string
  value: string | number
  sub?: React.ReactNode
  icon: React.ReactNode
}

export function KpiCard({ title, value, sub, icon }: KpiCardProps) {
  return (
    <div className="bg-white border border-[#EAECF0] p-4 rounded-[12px] flex justify-between">
      <div className="w-full h-20 flex flex-col gap-5 justify-between">
        <h2 className="font-hnd text-[14px]/[20px] tracking-[-0.02em] font-medium text-[#7A7A7A]">
          {title}
        </h2>

        <div className="flex items-baseline gap-2 font-hnd text-[24px]/[40px] tracking-[-0.02em] font-semibold text-[#101928]">
          {value}

          {sub}
        </div>
      </div>
      <div className="flex justify-center items-center gap-2.5 h-[66px] w-[66px] p-[13px] rounded-[100px] bg-[#027FA31A]">
        {icon}
      </div>
    </div>
  )
}
