"use client"

import {
  CallEndedAltIcon,
  CallPausedIcon,
  CallRecordIcon,
  CallStoppedIcon,
  EndCallIcon,
  LiveCallIcon,
  PlayRecordedCallIcon,
  ScheduleCallIcon,
  TransferredLiveCallIcon,
} from "@/components/svgs"
import { Button } from "@/components/ui/button"
import { Phone, PhoneIncoming } from "lucide-react"
import { useCallAgent } from "../_state"
import { TransferPopover } from "./TransferPopover"

export function CallPanel() {
  const { state, answer, end, transfer, schedule } = useCallAgent()
  const mm = String(Math.floor(state.seconds / 60)).padStart(2, "0")
  const ss = String(state.seconds % 60).padStart(2, "0")

  if (!state.callId) {
    return (
      <div className="h-full rounded-[24px] border border-[#EAECF0] bg-white p-4 flex justify-center items-center  gap-[24px]">
        <div className="tw-full text-center text-[#606060] font-medium font-hnd align-middle">
          <div className="mx-auto w-10 h-10 flex justify-center items-center rounded-[8px] border border-[#E9EAEB] p-2 shadow-[0px_4px_4px_0px_#0000000A]">
            <Phone className=" h-8 w-8" />
          </div>
          <p className="max-w-[270px] text-[16px] tracking-normal">
            Select a call in session to view or connect
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[322px] rounded-[16px] border border-[#EAECF0] p-4 flex flex-col justify-between">
      <div className="w-full flex justify-center items-center mb-2 text-[12px]">
        {state.status === "active" && (
          <span className="flex items-center gap-2 text-[#22D188] font-hnd font-medium text-[12px]/[20px] tracking-normal">
            <span className="h-[11px] w-[11px] rounded-full bg-[#22D188]" />
            Live Transcription Ongoing
          </span>
        )}
        {state.status === "ringing" && (
          <span className="flex items-center gap-2 text-[#027FA3] font-hnd font-medium text-[12px]/[20px] tracking-normal">
            <span className="h-[11px] w-[11px] rounded-full bg-[#99D8E6]" />
            Incoming call
          </span>
        )}
        {state.status === "ended" && (
          <span className="flex items-center gap-2 text-[#5F6368] font-hnd font-medium text-[12px]/[20px] tracking-normal">
            <span className="h-[11px] w-[11px] rounded-full bg-[#5F6368]" />
            Call ended
          </span>
        )}
      </div>

      <div className="grid place-items-center py-4">
        <div className="w-full  justify-center items-center flex flex-col gap-2">
          <div className="flex flex-col gap-6">
            {state.status === "active" && <LiveCallIcon />}
            {state.status === "transferring" && <TransferredLiveCallIcon />}
            {state.status === "ended" && <CallEndedAltIcon />}
            <div className="w-full flex flex-col justify-center items-center gap-1 font-hnd tracking-normal">
              <div className="text-center text-[16px]/[20px] font-medium text-[#344054] ">
                Hospital ABC
              </div>
              <div className="text-[14px]/[16px] text-[#B4B4B4]">
                CLM-043-LAG
              </div>
            </div>
          </div>
          <div className="gap-[5.56px] py-1 px-2 rounded-[8.34px] flex items-center">
            {state.status === "transferring" ? (
              <CallPausedIcon />
            ) : state.status === "active" ? (
              <CallRecordIcon />
            ) : state.status === "ended" ? (
              <CallStoppedIcon />
            ) : null}
            <span className="font-hnd font-medium text-[12px]/[13.9px] tracking-normal text-[#101010]">
              {state.status === "active"
                ? `${mm}:${ss}`
                : state.status === "ended"
                ? "02:56"
                : null}
            </span>
            <span>{state.status === "ended" && <PlayRecordedCallIcon />}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-[10px] p-4">
        {state.status === "ringing" && (
          <Button
            className="h-10 py-[10px] px-4 rounded-[16px] border border-[#1671D9] bg-[#1671D9] hover:bg-[#1671D9]/90 shadow-[0px_1px_2px_0px_#1018280D] gap-1 text-white text-[14px]/[20px]"
            onClick={answer}
          >
            <PhoneIncoming className="mr-2 h-5 w-5" /> Answer Call
          </Button>
        )}
        {state.status === "active" && (
          <Button
            variant="destructive"
            className="h-10 py-[10px] px-4 rounded-[16px] shadow-[0px_1px_2px_0px_#1018280D] gap-1 text-white text-[14px]/[20px] hover:bg-destructive/90"
            onClick={end}
          >
            <EndCallIcon /> End call
          </Button>
        )}
        <TransferPopover onTransfer={(agentId) => transfer(agentId)} />
        <Button
          variant="outline"
          className="h-10 py-[10px] px-4 rounded-[16px] border-[#D0D5DD] shadow-[0px_1px_2px_0px_#1018280D] gap-1 text-[#344054] text-[14px]/[20px] hover:bg-white/90"
          onClick={() => schedule(new Date(Date.now() + 3600e3).toISOString())}
        >
          <ScheduleCallIcon /> Schedule call
        </Button>
      </div>
    </div>
  )
}
