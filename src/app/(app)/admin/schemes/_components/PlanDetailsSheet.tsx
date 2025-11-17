"use client"

import { CustomSheet } from "@/components/overlays/SideDialog"
import { AngleRight } from "@/components/svgs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import EditPlanForm from "./EditPlan"
import { PlanItem } from "./types"
import React from "react"

function formatNaira(value: number): string {
  return `N ${value.toLocaleString()}`
}

export function PlanDetailsSheet({ plan }: { plan: PlanItem | null }) {
  const [open, setOpen] = React.useState(false)

  return (
    <CustomSheet
      title="Plan Details"
      subtitle=""
      trigger={
        <Button
          variant="outline"
          className="h-9 rounded-xl hover:bg-primary/90 hover:text-white text-[14px]/[20px] text-[#344054] bg-transparent"
        >
          View Plan <AngleRight />
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
            className="hover:bg-primary/10 hover:border-primary/10  hover:text-[#344054] text-[13.08px]/[18.63px] text-[#344054] font-hnd font-semibold tracking-normal"
          >
            Close
          </Button>
          <EditPlanForm />
        </div>
      }
      contentClassName="px-0"
    >
      <div className="w-full sm:w-[522px] flex flex-col gap-8 px-6">
        {!plan ? null : (
          <>
            {/* Plan Name */}
            <h3 className="text-[24px]/[32px] text-[#101828] font-bold font-hnd tracking-normal">
              {plan.name}
            </h3>

            {/* Stats Grid */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <Stat title="Premium" value={formatNaira(plan.premium)} />
                <Stat title="Services" value={String(plan.servicesCount)} />
                <Stat title="Activation Days" value={`${plan.waitDays} Days`} />
              </div>

              {/* Utilization Bandwidth */}
              <div className="w-full flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#EAECF0] bg-white h-20 py-4 px-2 font-hnd tracking-normal">
                <div className="text-[14px]/[16px] text-[#7B7B7B] font-medium">
                  Utilization Bandwidth
                </div>
                <div className="text-[16px]/[16px] font-bold text-[#344054]">
                  {formatNaira(plan.utilization)}
                </div>
              </div>
            </div>

            {/* Schemes */}
            <div className="flex flex-col gap-2">
              <label className="mb-2 text-[16px]/[24px] font-medium text-[#344054] block tracking-normal">
                Schemes
              </label>
              <div className="flex flex-wrap gap-4">
                {plan.schemes.map((scheme) => (
                  <Badge
                    key={scheme}
                    variant="secondary"
                    className="rounded-[6px] bg-white border border-[#D0D5DD] pl-2 pr-1 py-0.5 text-[14px]/[20px] font-medium text-[#344054] font-hnd tracking-normal"
                  >
                    {scheme}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Service Items */}
            <div className="h-[70px] flex flex-col gap-8 pt-4 border-t border-[#EAECF0]">
              <div className="w-full flex flex-col gap-0.5">
                <label className="mb-1 text-[18px]/[28px] font-bold text-[#101828] tracking-normal font-hnd">
                  Service Items ({plan.serviceItems.length})
                </label>
                <p className="text-[16px]/[24px] text-[#475467] font-normal font-hnd tracking-normal">
                  Services included in Plan
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {plan.serviceItems.map((item, index) => (
                  <div
                    key={index}
                    className="min-h-16 rounded-xl border border-[#EAECF0] bg-white px-4 py-2 text-[16px]/[24px] text-[#344054] font-normal font-hnd tracking-normal"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </CustomSheet>
  )
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="w-[147.33px] flex flex-col items-center justify-center gap-1 rounded-4 border border-[#EAECF0] bg-white h-20 py-4 px-2 font-hnd tracking-normal">
      <div className="text-[14px]/[16px] text-[#7B7B7B] font-medium">
        {title}
      </div>
      <div className="text-[16px]/[16px] font-bold text-[#344054]">{value}</div>
    </div>
  )
}
