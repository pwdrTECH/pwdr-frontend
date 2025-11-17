"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function ClaimsInfo() {
  return (
    <div className="w-full sm-[324px] flex flex-col gap-6 rounded-[24px] border border-[#EAECF0] pb-4">
      <div className="bg-[#F9FAFB] border-b border-[#EAECF0] w-full h-[58px] px-4 flex items-center gap-2 rounded-tl-[24px] rounded-tr-[24px] text-[13px] font-semibold text-[#111827]">
        Claims Information
      </div>
      <div className="w-full max-w-[292px] flex flex-col gap-8 px-4">
        <div className="w-full flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-[#FFE7CC] border-[1.33px] border-[#FFFFFF]">
            <Image
              src="/images/sahab.jpg"
              alt="Patient profile picture"
              width={64}
              height={64}
              className="object-cover"
            />
          </div>
          <div className="h-[49px] min-w-0">
            <div className="truncate text-[20px] font-hnd font-bold tracking-normal text-[#101828]">
              Muhammad Sahab
            </div>
            <div className="text-[14px]/[20px] text-[#989898]">
              muhammad@gmail.com
            </div>
          </div>
        </div>

        <dl className="flex flex-col gap-[10px] font-hnd">
          <Info k="Plan" v="Platinum Plan" />
          <Info k="ID" v="CLM-043-LAG" />
          <Info k="Dependants" v="3" />
          <Info k="Phone" v="08064527764" />
        </dl>

        <Button
          variant="outline"
          className="bg-[#EDF5FF] hover:bg-[#EDF5FF] h-[ 33.94px] w-fit rounded-[7.47px] py-[7.47px] px-[13.08px] shadow-[0px_0.93px_1.87px_0px_#1018280D] font-semibold text-[13.08px]/[18.68px] tracking-normal text-[#1671D9] border-0"
        >
          View Full Profile
        </Button>
      </div>
    </div>
  )
}
function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="w-full flex justify-between gap-[10px]">
      <dt className="text-[#979797] text-[14px]/[20px] font-normal tracking-normal">
        {k}
      </dt>
      <dd className="font-normal text-[15px]/[20px] text-[#344054]">{v}</dd>
    </div>
  )
}
