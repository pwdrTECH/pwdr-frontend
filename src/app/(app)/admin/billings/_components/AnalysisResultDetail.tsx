"use client"

import { CustomSheet } from "@/components/overlays/SideDialog"
import {
  ArrowRight,
  CopyIcon,
  MagicPenIcon,
  WarningIcon,
} from "@/components/svgs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ChevronRight, Printer, X } from "lucide-react"
import Image from "next/image"
import * as React from "react"
import { handlePrint } from "./print"

/** ---------- Types ---------- */
type TreatmentStatus = "approved" | "queried"
type AiVerdict = "approved" | "flagged"

type TreatmentItem = {
  id: string
  title: string
  code: string
  tag: string
  qty: number
  submitted: number
  payable: number
  status: TreatmentStatus
  aiVerdict: AiVerdict
  confidencePct: number
  note?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: any
}
function fmtNaira(n: number) {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`
}

function StatusBadge({ status }: { status: TreatmentStatus }) {
  if (status === "approved") {
    return (
      <span className="rounded-full border border-[#A6F4C5] bg-[#ECFDF3] px-3 py-1 text-[12px] font-medium text-[#027A48]">
        Approved
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 h-6 rounded-[32px] px-2 py-1 border border-[#DC97004D] bg-[#DC970021]  text-[14px] leading-[100%] font-bold text-[#DC9700]">
      Queried{" "}
      <WarningIcon className="w-4 h-4 text-[#DC9700]" data-no-print="true" />
    </span>
  )
}

function AiVerdictText({ v }: { v: AiVerdict }) {
  if (v === "approved") {
    return (
      <span className="text-[#06A81F] font-medium text-[14px] leading-[100%]">
        Approved
      </span>
    )
  }
  return (
    <span className="text-[#F79009] font-medium text-[14px] leading-[100%]">
      Flagged
    </span>
  )
}

function Progress({ pct, tone }: { pct: number; tone: "green" | "red" }) {
  return (
    <div className="flex items-center gap-3 min-w-[220px]">
      <div className="h-2 w-[140px] rounded-full bg-[#D7D6D6] overflow-hidden">
        <div
          className={cn(
            "h-full",
            tone === "green" ? "bg-[#06A81F]" : "bg-[#DE0303]"
          )}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
      <div className="text-[14px] text-[#555555]">{pct}%</div>
    </div>
  )
}

/** ---------- Mock data (matches screenshot feel) ---------- */
const ITEMS: TreatmentItem[] = [
  {
    id: "t1",
    title: "Gynaecologist Consultation",
    code: "CGGEFI98398092HJE",
    tag: "Consultation",
    qty: 100,
    submitted: 18000,
    payable: 18000,
    status: "approved",
    aiVerdict: "approved",
    confidencePct: 96,
  },
  {
    id: "t2",
    title: "Gynaecologist Consultation",
    code: "CGGEFI98398092HJE",
    tag: "Consultation",
    qty: 100,
    submitted: 18000,
    payable: 600000,
    status: "approved",
    aiVerdict: "approved",
    confidencePct: 96,
    note: "Duplicate medication detected. Total quantity exceeds protocol. Clinical justification required.",
  },
  {
    id: "t3",
    title: "Benadryl 25mg",
    code: "CGGEFI98398092HJE",
    tag: "Consultation",
    qty: 100,
    submitted: 18000,
    payable: 18000,
    status: "queried",
    aiVerdict: "flagged",
    confidencePct: 56,
    note: "Duplicate medication detected. Total quantity exceeds protocol. Clinical justification required.",
  },
]

export function ResultAnalysisDetailSheet({ row, open, onOpenChange }: Props) {
  const [openInsightFor, setOpenInsightFor] = React.useState<string | null>(
    null
  )
  const sheetContentRef = React.useRef<HTMLDivElement | null>(null)

  const requestId = "13/O/W7E27O"

  const approvedCount = 2
  const queriedCount = 1
  const rejectedCount = 0
  const totalPayable = 3324394

  const utilization = 850000
  const utilizationUsedPct = 32
  const balanceLeft = 578000

  const subTotal = 22000000
  const tax = 2200000
  const total = 39600

  function handleInsightAction(
    itemId: string,
    action: "approve" | "reject" | "query"
  ) {
    console.log("AI Insight action:", { itemId, action })
    setOpenInsightFor(null)
  }

  return (
    <CustomSheet
      open={open}
      onOpenChange={onOpenChange}
      panelClassName="w-[calc(100vw-32px)] xl:w-[1144px] max-w-[1144px]"
      contentClassName="p-0"
      position="center"
      footer={null}
      overlayClose
      closeIcon={
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange?.(false)}
          className={cn(
            "fixed left-36 top-6 z-[180]",
            "h-10 w-10 rounded-full bg-[#00000040] backdrop-blur-[5.76px] text-white",
            "inline-flex items-center justify-center shadow-sm"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      }
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#EAECF0]">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="min-w-0 flex items-center gap-2 text-[14px] text-[#667085]">
            <div className="min-w-0">
              <div className="truncate font-bold text-[16px] leading-6 text-[#344054]">
                Hospital XYZ
              </div>
              <div className="truncate text-[14px] leaidng-4 text-[#B4B4B4]">
                CLM-043-LAG
              </div>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0" />
            <button
              type="button"
              className="truncate text-[#636363] text-[14px] leading-[18px] cursor-pointer"
              onClick={() => onOpenChange?.(false)}
            >
              Bill ID - CK-20384
            </button>

            <ChevronRight className="h-4 w-4 shrink-0" />
            <div className="truncate text-[#636363] text-[14px] leading-[18px]">
              {requestId}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-xl border border-[#EAECF0] bg-white inline-flex items-center justify-center text-[#667085] cursor-pointer"
              aria-label="Edit"
            >
              <MagicPenIcon />
            </button>

            <button
              type="button"
              onClick={() => handlePrint(sheetContentRef.current)}
              className="h-10 px-4 rounded-xl border border-[#EAECF0] bg-white inline-flex items-center justify-center gap-2 text-[#344054] text-[14px] cursor-pointer"
              aria-label="Print"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>

            <button
              type="button"
              className="h-10 w-10 rounded-full border border-[#D1E9FF] bg-white inline-flex items-center justify-center text-[#1671D9] cursor-pointer"
              aria-label="Swap"
            >
              <Image
                src="/logo-head.svg"
                width={40}
                height={40}
                alt="logo head"
              />
            </button>
          </div>
        </div>
      </div>
      <div ref={sheetContentRef}>
        <div className="px-6 py-4 flex flex-col gap-2.5 bg-[#F9F9F9]">
          <h2 className="h-[18px] text-[22px] leading-[18px] font-medium text-[#636363]">
            Claim Details
          </h2>
          <div className="w-full flex flex-col gap-2 py-2">
            {/* Claim Details Card */}
            <div className="w-full rounded-2xl border border-[#EAECF0] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="w-full lg:w-[511px] flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-[16px] leading-[100%] font-medium text-[#726E75]">
                      Request ID:
                    </div>
                    <div className="text-[16px] leading-[100%] font-medium text-[#343137] ">
                      {requestId}
                    </div>
                    <button
                      type="button"
                      className="text-[#646668] hover:text-[#646668]/80 cursor-pointer"
                      aria-label="Copy request id"
                      onClick={() => navigator.clipboard?.writeText(requestId)}
                      data-no-print="true"
                    >
                      <CopyIcon />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 border-b border-[#EAECF0] pb-4">
                    <Stat label="Approved" value={approvedCount} tone="green" />
                    <Stat label="Queried" value={queriedCount} tone="amber" />
                    <Stat label="Rejected" value={rejectedCount} tone="red" />
                    <div>
                      <div className="text-[14px] leading-5 text-[#6F6F6F]">
                        Total Payable
                      </div>
                      <div className="mt-1 text-[16px] leading-5 font-bold text-[#344054]">
                        {fmtNaira(totalPayable)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-2 rounded-3xl">
                  <div className="h-10 w-10 rounded-full bg-[#F2F4F7] overflow-hidden">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="/images/sahab.jpg"
                        alt="Muhammad Sahab"
                      />
                      <AvatarFallback className="bg-[#F2F4F7] text-[#667085] text-[12px] font-medium">
                        MS
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[16px] leading-[100%] font-medium text-[#404040]">
                      Muhammad Sahab
                    </div>
                    <div className="text-[13px] leading-[100%] text-[#726E75] flex items-center gap-2 mt-1">
                      SHTL/CAC/11081
                      <button
                        type="button"
                        className="text-[#98A2B3] hover:text-[#667085] cursor-pointer"
                        aria-label="Copy enrollee id"
                        onClick={() =>
                          navigator.clipboard?.writeText("SHTL/CAC/11081")
                        }
                        data-no-print="true"
                      >
                        <CopyIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-7 pt-4 border-t border-[#EDEDED]">
                <Info label="Encounter Date" value="Wed Dec 04 2024" />
                <Info label="Gender" value="Female" />
                <Info label="Age" value="32 years" />

                <Info
                  label="Diagnoses"
                  value="Acute Upper Respiratory Tract Infection"
                />
                <Info label="Request ID" value="RDU27G/04" />
                <Info label="Created By" value="ACME Hospital" />
              </div>

              <div className="rounded-xl border border-[#1671D929] bg-[#FFFFFF0F] p-2 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="h-[28px] flex items-center gap-3 py-1 px-2">
                    <span className="text-[#2669CC] font-medium text-[14px] leading-5">
                      Plan:
                    </span>
                    <span className="text-[#3F3F3F] text-[16px] leading-5 font-medium">
                      Gold
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#2669CC] font-medium text-[14px] leading-5">
                      Utilization
                    </span>
                    <span className="text-[#3F3F3F] text-[16px] leading-5 font-medium">
                      {fmtNaira(utilization)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#2669CC] font-medium text-[14px] leading-5">
                      Utilization Used
                    </span>
                    <span className="text-[#4AA802] font-medium text-[14px] leading-5">
                      {utilizationUsedPct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#2669CC] font-medium text-[14px] leading-5">
                      Balance left
                    </span>
                    <span className="text-[#3F3F3F] text-[16px] leading-5 font-medium">
                      {fmtNaira(balanceLeft)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment Items */}
            <div className="rounded-2xl border border-[#EAECF0] bg-white overflow-hidden">
              <div className="p-4 border-b border-[#EAECF0] text-[18px] leading-6 font-semibold text-[#101828]">
                Treatment Items
              </div>

              <div className="divide-y divide-[#EAECF0]">
                {ITEMS.map((it) => (
                  <div key={it.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[16px] leading-[18px] font-medium text-[#101828]">
                          {it.title}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[12px] text-[#667085]">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1671D9]" />
                          <span className="truncate">{it.code}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-[#667085]">
                          <span className="rounded-[5px] border border-[#155BE81A] bg-[#EAF2FA] px-2 py-1 text-[#155BE8] text-[14px] leading-4 font-medium">
                            {it.tag}
                          </span>

                          <span className="text-[13.08px] leading-[18.88p] text-[#667085]">
                            Qty:{" "}
                            <span className="text-[#101828] text-[14px] leading-[18px] font-medium ml-1.25">
                              {it.qty}
                            </span>
                          </span>

                          <span className="text-[13.08px] leading-[18.88p] text-[#667085]">
                            Submitted:{" "}
                            <span className="text-[#101828] text-[14px] leading-[18px] font-medium ml-1.25">
                              {fmtNaira(it.submitted)}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-[12px] text-[#667085]">
                          Payable Bill:{" "}
                          <span className="text-[#101828] font-semibold text-[14px]">
                            {fmtNaira(it.payable)}
                          </span>
                        </div>

                        <StatusBadge status={it.status} />

                        {/* AI Insight dropdown (matches screenshot) */}
                        <Popover
                          open={openInsightFor === it.id}
                          onOpenChange={(v) =>
                            setOpenInsightFor(v ? it.id : null)
                          }
                          data-no-print="true"
                        >
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="h-8 w-8 rounded-full border border-[#EAECF0] bg-white inline-flex items-center justify-center text-[#667085]"
                              aria-label="Open AI Insight"
                              data-no-print="true"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>

                          <PopoverContent
                            align="end"
                            side="right"
                            sideOffset={12}
                            className="z-[999] w-[180px] rounded-xl border border-[#EAECF0] bg-white p-3 shadow-[0px_12px_24px_-6px_#1018281A]"
                          >
                            <div className="text-[14px] font-medium text-[#667085] mb-2">
                              AI Insight
                            </div>

                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleInsightAction(it.id, "approve")
                                }
                                className="w-full h-9 rounded-lg border border-[#2563EB] text-[#2563EB] bg-white font-medium text-[14px] hover:bg-[#EFF6FF]"
                                data-no-print="true"
                              >
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleInsightAction(it.id, "reject")
                                }
                                className="w-full h-9 rounded-lg border border-[#F04438] text-[#B42318] bg-white font-medium text-[14px] hover:bg-[#FEF3F2]"
                                data-no-print="true"
                              >
                                Reject
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleInsightAction(it.id, "query")
                                }
                                className="w-full h-9 rounded-lg border border-[#D0D5DD] text-[#344054] bg-white font-medium text-[14px] hover:bg-[#F9FAFB]"
                                data-no-print="true"
                              >
                                Query
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-6 text-[13px] border-t border-[#EAECF0] pt-3">
                      <div className="text-[#101828] text-[14px] leading-[100%] font-medium">
                        AI Verdict: <AiVerdictText v={it.aiVerdict} />
                      </div>
                      <div className="h-[23px] bg-[#D7D6D6]"></div>
                      <div className="text-[#344054] flex items-center gap-3">
                        <span className="text-[#101828] text-[14px] leading-[100%] font-medium">
                          Confidence:
                        </span>
                        <Progress
                          pct={it.confidencePct}
                          tone={it.aiVerdict === "approved" ? "green" : "red"}
                        />
                      </div>
                      <div className="h-[23px] bg-[#D7D6D6]"></div>
                      {it.note ? (
                        <div className="text-[#667085] text-[14px] leading-4 min-w-[260px] flex-1">
                          {it.note}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 bg-white border-t border-[#EAECF0]">
                <div className="ml-auto max-w-[246px] space-y-2">
                  <Line label="Sub Total" value={fmtNaira(subTotal)} />
                  <Line label="Tax (10%)" value={fmtNaira(tax)} />
                </div>
              </div>
              <div className="px-5 py-4 mt-3 border-t bg-[#F9FAFC] border-[#EAECF0] flex items-center justify-end text-[14px]">
                <div className="w-[135px] text-[#1671D9] font-bold text-[16px] leaing-[18.68px] ">
                  Total
                </div>
                <div className="w-fit text-[#1671D9] font-bold text-[20px] leading-[22px]">
                  {fmtNaira(total)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomSheet>
  )
}

/** ---------- small UI ---------- */
function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "green" | "amber" | "red"
}) {
  const color =
    tone === "green"
      ? "text-[#0EA300]"
      : tone === "amber"
      ? "text-[#DC9700]"
      : tone === "red"
      ? "text-[#D90101]"
      : "text-[#344054]"
  return (
    <div>
      <div className="text-[14px] leading-5 text-[#6F6F6F]">{label}</div>
      <div className={cn("mt-[7px] text-[16px] leading-5 font-bold", color)}>
        {value}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[14px] leading-5 text-[#6F6F6F]">{label}</div>
      <div className="mt-[7px] text-[15px] leading-6 font-bold text-[#484F59]">
        {value}
      </div>
    </div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[#101828] text-[14px] leading-[18.88px] ">
        {label}
      </div>
      <div className="text-[#667085] font-bold text-[16px] leading-5">
        {value}
      </div>
    </div>
  )
}
