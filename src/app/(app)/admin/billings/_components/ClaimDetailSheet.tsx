"use client"

import React from "react"
import { CustomSheet } from "@/components/overlays/SideDialog"
import {
  CautionTriangle,
  MarkedaltIcon,
  MarkedIcon,
  WhiteMarkedIcon,
} from "@/components/svgs"
import TablePagination from "@/components/table/pagination"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { ResultAnalysisDetailSheet } from "./AnalysisResultDetail"
import { SheetTitle } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/** ---------- Types ---------- */
type StatusKey = "approved" | "flagged" | "rejected"
type RiskKey = "low" | "mid" | "high"

export type ClaimRow = {
  claimId: string
  enrolleeName: string
  enrolleeSubId: string
  amount: number
  a: number
  q: number
  r: number
  status: StatusKey
  risk: RiskKey
  remark: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** ---------- Helpers ---------- */
function fmtNaira(n: number) {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`
}

function StatusPill({ status }: { status: StatusKey }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#ABEFC6] bg-[#ECFDF3] px-1.5 py-0.5 text-[12px] leading-[18px] font-inter font-medium text-[#067647]">
        <MarkedIcon className="h-3 w-3" />
        Approved
      </span>
    )
  }

  if (status === "flagged") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#FEDF89] bg-[#FFFAEB] px-1.5 py-0.5 text-[12px] leading-[18px] font-inter font-medium text-[#B54708]">
        <CautionTriangle />
        Flagged
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#FECDCA] bg-[#FEF3F2] px-1.5 py-0.5 text-[12px] leading-[18px] font-inter font-medium text-[#B42318]">
      <X className="h-4 w-4 text-[#B42318]" />
      Rejected
    </span>
  )
}

function RiskPill({ risk }: { risk: RiskKey }) {
  if (risk === "low") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#ABEFC6] bg-[#ECFDF3] px-1.5 py-0.5 text-[12px] leading-[18px] font-inter font-medium text-[#067647]">
        Low Risk
      </span>
    )
  }
  if (risk === "mid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#FEDF89] bg-[#FFFAEB] px-1.5 py-0.5 text-[12px] leading-[18px] font-inter font-medium text-[#B54708]">
        Mid Risk
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#FECDCA] bg-[#FEF3F2] px-1.5 py-0.5 text-[12px] leading-[18px] font-inter font-medium text-[#B42318]">
      High Risk
    </span>
  )
}

/** ---------- Mock data ---------- */
const MOCK_ROWS: ClaimRow[] = [
  {
    claimId: "13/O/W7E27O",
    enrolleeName: "Olarewaju Michael Saheed",
    enrolleeSubId: "13/O/J9R42N",
    amount: 23324394,
    a: 3,
    q: 0,
    r: 0,
    status: "approved",
    risk: "low",
    remark: "Claim is verified and approved",
  },
  {
    claimId: "13/O/W7E27O",
    enrolleeName: "Olarewaju Michael Saheed",
    enrolleeSubId: "13/O/J9R42N",
    amount: 23324394,
    a: 3,
    q: 1,
    r: 0,
    status: "flagged",
    risk: "mid",
    remark: "Claim is verified and approved",
  },
  {
    claimId: "13/O/W7E27O",
    enrolleeName: "Olarewaju Michael Saheed",
    enrolleeSubId: "13/O/J9R42N",
    amount: 23324394,
    a: 0,
    q: 0,
    r: 3,
    status: "rejected",
    risk: "high",
    remark: "Claim is verified and approved",
  },
  {
    claimId: "13/O/W7E27O",
    enrolleeName: "Olarewaju Michael Saheed",
    enrolleeSubId: "13/O/J9R42N",
    amount: 23324394,
    a: 3,
    q: 0,
    r: 0,
    status: "approved",
    risk: "low",
    remark: "Claim is verified and approved",
  },
  {
    claimId: "13/O/W7E27O",
    enrolleeName: "Olarewaju Michael Saheed",
    enrolleeSubId: "13/O/J9R42N",
    amount: 23324394,
    a: 3,
    q: 0,
    r: 0,
    status: "approved",
    risk: "low",
    remark: "Claim is verified and approved",
  },
  {
    claimId: "13/O/W7E27O",
    enrolleeName: "Olarewaju Michael Saheed",
    enrolleeSubId: "13/O/J9R42N",
    amount: 23324394,
    a: 3,
    q: 0,
    r: 0,
    status: "approved",
    risk: "low",
    remark: "Claim is verified and approved",
  },
  {
    claimId: "13/O/W7E27O",
    enrolleeName: "Olarewaju Michael Saheed",
    enrolleeSubId: "13/O/J9R42N",
    amount: 23324394,
    a: 3,
    q: 0,
    r: 0,
    status: "approved",
    risk: "low",
    remark: "Claim is verified and approved",
  },
  {
    claimId: "13/O/W7E27O",
    enrolleeName: "Olarewaju Michael Saheed",
    enrolleeSubId: "13/O/J9R42N",
    amount: 23324394,
    a: 3,
    q: 0,
    r: 0,
    status: "approved",
    risk: "low",
    remark: "Claim is verified and approved",
  },
]

/** ---------- Small UI pieces ---------- */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[13px] leading-5 text-[#475467]">{label}</div>
      <div className="text-[16px] leading-5 font-medium text-[#3F3F3F]">
        {value}
      </div>
    </div>
  )
}

/** ---------- Main Sheet ---------- */
export function ClaimDetailSheet({ open, onOpenChange }: Props) {
  const [page, setPage] = React.useState(1)
  const pageSize = 8
  const totalItems = MOCK_ROWS.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)

  const startIndex = (safePage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const pagedRows = React.useMemo(
    () => MOCK_ROWS.slice(startIndex, endIndex),
    [startIndex, endIndex]
  )
  const controlsId = "claims-table-pagination"

  // detail sheet state
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [selectedRow, setSelectedRow] = React.useState<ClaimRow | null>(null)

  function openDetail(row: ClaimRow) {
    setSelectedRow(row)
    setDetailOpen(true)
  }

  React.useEffect(() => {
    if (!open) {
      setPage(1)
      setDetailOpen(false)
      setSelectedRow(null)
    }
  }, [open])

  return (
    <CustomSheet
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="p-0"
      footer={null}
      position="center"
      panelClassName="w-[calc(100vw-32px)] xl:w-[1144px] max-w-[1144px]"
      trigger={
        <Button
          type="button"
          className="h-9 bg-[#1671D9] text-[14px] leading-5 py-2 px-3.5 text-sm text-white hover:bg-[#1671D9]/80"
        >
          View Claim <ChevronRight />
        </Button>
      }
      closeIcon={
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className={cn(
            "fixed left-16 top-6 z-[180]",
            "h-10 w-10 rounded-full bg-[#00000040] backdrop-blur-[5.76px] text-white",
            "inline-flex items-center justify-center shadow-sm"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      }
    >
      {/* HEADER BAR */}
      <SheetTitle className="w-full sticky top-0 z-10 bg-white border-b border-[#EAECF0]">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="min-w-0 flex items-center gap-2 text-[14px] text-[#475467]">
            <div className="min-w-0 flex flex-col">
              <div className="truncate font-bold text-[16px] leading-6 text-[#344054]">
                Hospital XYZ
              </div>
              <button
                type="button"
                className="truncate text-[14px] text-[#B4B4B4] cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                CLM-043-LAG
              </button>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0" />

            <div className="truncate text-[#636363] text-[14px] leading-[18px]">
              Bill ID - CK-20384
            </div>
          </div>

          <div className="ml-auto">
            <button
              type="button"
              className="h-10 w-10 rounded-full border border-[#EAECF0] bg-white inline-flex items-center justify-center text-[#1671D9]"
              aria-label="Action"
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
      </SheetTitle>

      {/* BODY */}
      <div className="w-full px-6 py-4 flex flex-col gap-2.5 bg-[#F9F9F9]">
        {/* Status row */}
        <div className="h-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-[18px] bg-[#DFF7E2CC] px-2 py-1 text-[16px] leading-4 font-medium text-[#30C647]">
            <MarkedaltIcon />
            Analysis Complete
          </span>

          <span className="h-6 inline-flex items-center gap-2 rounded-[18px] bg-[#27CA40] px-2 py-1 text-[16px] leading-4 font-medium text-white">
            <WhiteMarkedIcon className="h-4 w-4 text-white" />
            Approved
          </span>
        </div>

        <div className="w-full flex items-start justify-between gap-6">
          <div className="min-w-[320px]">
            <div className="text-[14px] leading-5 font-medium text-[#101928]">
              Bill Information
            </div>
            <div className="mt-2.5 space-y-1.5 text-[16px] leading-6 text-[#4F4F4F]">
              <div>Provider: Hospital Name</div>
              <div>Provider ID: CLM-043-LAG</div>
              <div>Bill ID: CK-20384</div>
            </div>
          </div>

          <div className="flex-1 max-w-[620px] rounded-2xl border border-[#EAECF0] bg-white px-5 py-4">
            <div className="grid grid-cols-4 gap-6">
              <Metric label="Total Cost" value="₦3,300,000" />
              <Metric label="No. of claims" value="85" />
              <Metric label="No. of flagged claims" value="28" />
              <Metric label="No. of Rejected claims" value="5" />
            </div>
          </div>
        </div>

        {/* ✅ SHADCN TABLE WRAPPER */}
        <div className="rounded-2xl border border-[#EAECF0] overflow-hidden bg-white">
          <div className="w-full overflow-auto">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow className="border-b border-[#EAECF0]">
                  <TableHead className="w-[140px] text-[#475467]">
                    Claim ID
                  </TableHead>
                  <TableHead className="w-[300px] text-[#475467]">
                    Enrollee name
                  </TableHead>
                  <TableHead className="w-[140px] text-[#475467]">
                    Amount
                  </TableHead>
                  <TableHead className="w-[90px] text-[#475467]">
                    A/Q/R
                  </TableHead>
                  <TableHead className="w-[210px] text-[#475467]">
                    Status
                  </TableHead>
                  <TableHead className="text-[#475467]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {pagedRows.map((row, idx) => {
                  const rowKey = `${row.claimId}-${startIndex + idx}`

                  return (
                    <TableRow
                      key={rowKey}
                      // role="button"
                      tabIndex={0}
                      onClick={() => openDetail(row)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") openDetail(row)
                      }}
                      className={cn(
                        "cursor-pointer",
                        "hover:bg-[#F9FAFB] focus:outline-none"
                      )}
                    >
                      <TableCell className="text-[14px] leading-5 text-[#475467]">
                        {row.claimId}
                      </TableCell>

                      <TableCell className="min-w-0">
                        <div className="text-[16px] leading-6 font-medium text-[#293347] truncate">
                          {row.enrolleeName}
                        </div>
                        <div className="text-[14px] leading-4 text-[#636E7D] flex items-center gap-2">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E3E3E3]" />
                          <span className="truncate">{row.enrolleeSubId}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-[14px] leading-5 text-[#475467]">
                        {fmtNaira(row.amount)}
                      </TableCell>

                      <TableCell className="text-[14px] leading-5 font-bold">
                        <span className="text-[#0EA400]">{row.a}</span>
                        <span className="text-[#475467]"> / </span>
                        <span className="text-[#DC9700]">{row.q}</span>
                        <span className="text-[#475467]"> / </span>
                        <span className="text-[#D90101]">{row.r}</span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusPill status={row.status} />
                          <RiskPill risk={row.risk} />
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="ml-auto w-full h-9 max-w-[290px] rounded-xl border border-[#27CA4066] bg-[#27CA400F] px-3 py-2 text-[14px] leading-5 text-[#475467] inline-flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#067647]" />
                          <span className="truncate">{row.remark}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            page={page}
            onPageChange={setPage}
            totalItems={totalItems}
            pageSize={pageSize}
            boundaryCount={1}
            siblingCount={1}
            controlsId={controlsId}
          />
        </div>

        {/* detail sheet */}
        <ResultAnalysisDetailSheet
          open={detailOpen}
          onOpenChange={setDetailOpen}
          row={selectedRow}
        />
      </div>
    </CustomSheet>
  )
}
