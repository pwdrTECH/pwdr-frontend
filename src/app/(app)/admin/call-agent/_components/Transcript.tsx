"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useCallAgent } from "../_state"

export function TranscriptBox() {
  const { state } = useCallAgent()
  const disabled = !state.callId
  const length = state.transcript.length
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to the bottom whenever the transcript length changes
  useEffect(() => {
    if (!containerRef.current) return
    if (length === 0) return

    const el = containerRef.current
    el.scrollTop = el.scrollHeight
  }, [length])

  // Choose header dot + label based on status
  const headerDotColor =
    state.status === "active"
      ? "#2FB969"
      : state.status === "ended"
      ? "#5F6368"
      : "#FBBF24" // idle / no live transcript
  const headerLabel =
    state.status === "active"
      ? "Transcription (live)"
      : state.status === "ended"
      ? "Transcription (completed)"
      : "Transcription"

  const hasLines = length > 0

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-[#EAECF0] bg-[#F9FAFB]">
      <div className="h-[58px] flex items-center gap-2 px-4 pb-4">
        <span
          className="h-[11px] w-[11px] rounded-full"
          style={{ backgroundColor: headerDotColor }}
        />
        <span className="text-[16px]/[120%] font-hnd font-medium text-[#344054] tracking-normal">
          {headerLabel}
        </span>
      </div>

      <div
        ref={containerRef}
        className="bg-white max-h-[420px] flex flex-col overflow-y-auto px-4 pb-4"
      >
        {disabled ? (
          <div className="grid place-items-center rounded-md border border-dashed border-[#E5E7EB] p-12 text-[#98A2B3] text-[14px]">
            Start or select a call to continue live transcription.
          </div>
        ) : !hasLines ? (
          <div className="grid place-items-center rounded-md border border-dashed border-[#E5E7EB] p-8 text-[#98A2B3] text-[13px] text-center">
            {state.status === "active"
              ? "We’re connected. Waiting for the first transcript line from this call…"
              : "No transcript has been received for this call yet."}
          </div>
        ) : (
          state.transcript.map((t) => (
            <Row
              key={t.id}
              right={t.who === "caller"}
              time={secondsToMMSS(t.at)}
              who={t.who === "ai" ? "Powder AI" : "Caller"}
              text={t.text}
            />
          ))
        )}
      </div>
    </div>
  )
}

function Row({
  time,
  who,
  text,
  right,
}: {
  time: string
  who: string
  text: string
  right?: boolean
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[56px_1fr] items-start gap-3 mb-3",
        right && "text-right"
      )}
    >
      <div
        className={cn(
          "h-[21px] w-[49px] flex items-center gap-[10px] pt-3",
          right && "order-2"
        )}
      >
        <div className="text-[13px]/[120%] text-[#BCBCBC]">{time}</div>
        <span className="h-2 w-2 rounded-full bg-[#C8C8C8] flex-shrink-0" />
      </div>
      <div className={cn("flex flex-col gap-1", right && "order-1")}>
        <div
          className={cn(
            "text-[14px]/[120%] font-normal font-hnd tracking-normal",
            who === "Powder AI" ? "text-[#1671D9]" : "text-[#344054]"
          )}
        >
          {who}:
        </div>
        <div
          className={cn(
            "max-w-prose rounded-xl px-3 py-2 text-[14px]/[120%] text-[#647083]",
            right ? "ml-auto bg-[#F0F6FF]" : "bg-[#F7F9FB]"
          )}
        >
          {text}
        </div>
      </div>
    </div>
  )
}

function secondsToMMSS(n: number) {
  const m = String(Math.floor(n / 60)).padStart(2, "0")
  const s = String(n % 60).padStart(2, "0")
  return `${m}:${s}`
}
