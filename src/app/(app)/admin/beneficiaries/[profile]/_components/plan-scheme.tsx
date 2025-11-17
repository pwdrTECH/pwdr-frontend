"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PlanSchemeSection() {
  const planHistory = [
    {
      status: "Active",
      color: "bg-[#E7EFFC] text-[#0F5FD9]",
      amount: "N 50,000",
      date: "June 27, 1993",
    },
    {
      status: "Expired",
      color: "bg-[#F8D4D4] text-[#D90F0F]",
      amount: "N 50,000",
      date: "June 27, 1993",
    },
    {
      status: "Expired",
      color: "bg-[#F8D4D4] text-[#D90F0F]",
      amount: "N 50,000",
      date: "June 27, 1993",
    },
  ]

  return (
    <div className="flex flex-col gap-[19px] rounded-3xl border border-[#EAECF0] pb-4">
      <div className="bg-[#EFEFEF59] h-[58px] gap-2 border-b py-[19px] px-4">
        <h3 className="text-[16px]/[20px] font-hnd font-bold text-[#5F656B] tracking-normal">
          Plan & Scheme
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4 h-[46px] px-4">
        <div>
          <p className="text-[#656565] font-hnd text-[14px]/[18px] tracking-normal">
            Scheme:
          </p>
          <p className="font-medium text-[16px]/[20px] text-[#3D4449] tracking-normal">
            NHIS
          </p>
        </div>

        <div>
          <p className="text-[#656565] font-hnd text-[14px]/[18px] tracking-normal">
            Plan:
          </p>
          <p className="font-medium text-[16px]/[20px] text-[#3D4449] tracking-normal">
            Pearl Plan
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-[19px] px-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[14px]/[18px] font-hnd font-medium text-[#656565]">
            Plan History
          </h4>
          <Button
            variant="link"
            className="text-[#726E75] font-bold hover:bg-transparent text-sm p-0 h-auto"
          >
            View All
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {planHistory.map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-[14px] py-2 px-[14px] border border-[#EAECF0] rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-hnd font-medium text-[#474747]">
                  Pearl Plan
                </p>
                <Badge
                  className={`text-[14px]/[14px] border-0 py-1 px-2 rounded-2xl ${item.color}`}
                >
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#474747] font-hnd font-medium">
                  {item.amount}
                </p>
                <p className="text-sm text-[#474747] font-hnd font-medium">
                  {item.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
