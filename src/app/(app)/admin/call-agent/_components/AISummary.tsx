"use client"

import {
  MagicPenIcon,
  VerifiedFilledIcon,
  VerifiedOutlinedIcon,
} from "@/components/svgs"
import Image from "next/image"
import { useCallAgent } from "../_state"

export function AISummary() {
  const { state } = useCallAgent()
  const done = state.status === "ended"
  const error = false

  return (
    <div className="w-full sm-[324px] flex flex-col gap-6 rounded-3xl border border-[#EAECF0] pb-4">
      <div className="bg-[#F9FAFB] border-b border-[#EAECF0] w-full h-[58px] px-4 flex items-center gap-2 rounded-tl-3xl rounded-tr-3xl text-[13px] font-semibold text-[#111827]">
        <MagicPenIcon /> AI Summary
      </div>

      {!done ? (
        <div className="px-4">
          <div className="w-fullflex flex-col gap-3">
            <div className="w-full h-[38px] px-4">
              <Image
                src="/logo-head.gif"
                alt="Powder logo head"
                width={38}
                height={38}
              />
            </div>
            <div className="h-5 px-4 text-[14px]/[20px] tracking-normal font-medium font-hnd text-[#101928]">
              Analyzing call.
            </div>
          </div>
          <div className=" h-[52px] rounded-[12px] border border-[#EAECF0] p-4 bg-[#FAFAFA]" />
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4">
          <div className="w-fit h-6 inline-flex items-center gap-2 rounded-[18px] bg-[#DFF7E2CC] px-[4.5px] py-2 text-[11px]/[16px] font-hnd font-medium text-[#1F9254] tracking-normal">
            <VerifiedFilledIcon /> Analysis Complete
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-[14px]/[20px] font-medium text-[#101928] font-hnd tracking-normal">
              Claims Information
            </div>
            <ul className="text-[12px]/[18px] text-[#7A7A7A] tracking-normal font-hnd flex flex-col gap-2.5">
              <li>Patient Name: Omuh Victor</li>
              <li>Patient ID: CLM-043-LAG</li>
              <li>Hospital: Hospital Name</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-[14px]/[20px] font-medium text-[#101928] font-hnd tracking-normal">
              Verification Points
            </div>
            {error ? (
              <div className="space-y-[3px]">
                <Verify text="Plan is not currently active" error={error} />
                <Verify
                  text="This service is not covered by your plan"
                  error={error}
                />
                <Verify
                  text="Patient's benefits have been fully used"
                  error={error}
                />
              </div>
            ) : (
              <div className="space-y-[3px]">
                <Verify text="Plan is active" />
                <Verify text="This service is covered by the plan" />
                <Verify text="Patient still have available benefits" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-[14px]/[20px] font-medium text-[#101928] font-hnd tracking-normal">
              Summary
            </div>
            <p className="text-[12px]/[18px] font-normal font-hnd tracking-normal text-[#7A7A7A]">
              Your claim has been successfully verified. The reported visit and
              symptoms align with your medical history and are covered under
              your plan.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
function Verify({ text, error }: { text: string; error?: boolean }) {
  return (
    <div
      className={`h-9 flex items-center gap-1.5 rounded-tl-2xl rounded-tr-2xl rounded-br-1 rounded-bl-1 ${
        error ? "bg-[#FAF4F4]" : "bg-[#F4FAF5] "
      } p-2 text-[13px]/[20px] font-medium font-hnd text-[#181A1985]`}
    >
      <VerifiedOutlinedIcon
        className={error ? "text-[#FF6058]" : "text-[#27CA40]"}
      />{" "}
      {text}
    </div>
  )
}
