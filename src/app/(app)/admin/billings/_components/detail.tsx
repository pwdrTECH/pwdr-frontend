"use client"

import { CustomSheet } from "@/components/overlays/SideDialog"
import { SignatureIcon } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useBillingDetails } from "@/lib/api/billing"
import Image from "next/image"
import * as React from "react"
import type { BillingRow } from "../page"
import { downloadNodeAsPdf } from "./pdf"
import { handlePrint } from "./print"

const formatNaira = (v: number) =>
  `₦${Number(v || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`

type DetailVariant = "single" | "multi"

type BillServiceLine = {
  id: string
  encounterDate: string
  enrolleeId: string
  enrolleeName: string
  diagnosis: string
  code: string
  services: { label: string; cost: number; color: string }[]
  drugs?: { label: string; cost: number; color: string }[]
}

interface BillDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: BillingRow
  variant: DetailVariant
}

function toLinesFromDetails(details: any[]): BillServiceLine[] {
  const lines: BillServiceLine[] = []

  for (const d of details ?? []) {
    const encounterDate = String(d.encounter_date ?? "")
    const enrolleeId = String(d.enrolee_id ?? "")
    const enrolleeName = String(d.enrolee_name ?? "")
    const diagnosis = String(d.diagnosis ?? "")

    const groups = Array.isArray(d.services) ? d.services : []
    for (const g of groups) {
      const code = String(g.code ?? "")
      const items = Array.isArray(g.items) ? g.items : []

      const services = items
        .filter((x: any) => String(x.item_type ?? "").toLowerCase() !== "drug")
        .map((x: any) => ({
          label: String(x.service_name ?? ""),
          cost: Number(x.cost ?? 0),
          color: "#00B894",
        }))

      const drugs = items
        .filter((x: any) => String(x.item_type ?? "").toLowerCase() === "drug")
        .map((x: any) => ({
          label: String(x.service_name ?? ""),
          cost: Number(x.cost ?? 0),
          color: "#9B59B6",
        }))

      lines.push({
        id: code || `${encounterDate}-${enrolleeId}`,
        encounterDate,
        enrolleeId,
        enrolleeName,
        diagnosis,
        code,
        services,
        drugs: drugs.length ? drugs : undefined,
      })
    }
  }

  return lines
}

export function BillDetailSheet({
  open,
  onOpenChange,
  bill,
  variant,
}: BillDetailSheetProps) {
  const sheetContentRef = React.useRef<HTMLDivElement | null>(null)
  const invoiceNumber = bill.invoiceNumber
  const [downloading, setDownloading] = React.useState(false)

  const detailsQuery = useBillingDetails(invoiceNumber, open)

  const lines = React.useMemo(() => {
    const data = detailsQuery.data ?? []
    return toLinesFromDetails(data)
  }, [detailsQuery.data])

  const subtotal = React.useMemo(() => {
    return lines.reduce(
      (sum, l) =>
        sum +
        l.services.reduce((s, x) => s + x.cost, 0) +
        (l.drugs?.reduce((s, x) => s + x.cost, 0) ?? 0),
      0
    )
  }, [lines])

  const tax = subtotal * 0.1
  const totalDue = subtotal + tax

  return (
    <CustomSheet
      title="Bill Review"
      subtitle={`${bill.provider} · ${bill.dueDate}`}
      open={open}
      onOpenChange={onOpenChange}
      position="center"
      contentClassName="px-10 py-6 space-y-8"
      footer={
        <div
          data-no-print="true"
          className="w-full flex items-center justify-between border-t border-[#EAECF0] pt-4"
        >
          <div className="text-[11px] text-[#9CA3AF]">
            Invoice: {invoiceNumber || "—"}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-full px-4 text-sm hover:bg-[#1D4ED8]"
              onClick={() => handlePrint(sheetContentRef.current)}
            >
              Print
            </Button>
            <Button
              type="button"
              disabled={downloading}
              className="h-9 rounded-full bg-[#2563EB] px-4 text-sm text-white hover:bg-[#1D4ED8]"
              onClick={async () => {
                if (!sheetContentRef.current) return
                await downloadNodeAsPdf(sheetContentRef.current, {
                  fileName: `invoice-${invoiceNumber || "document"}.pdf`,
                  marginMm: 10,
                  scale: 2,
                })
              }}
            >
              {downloading ? "Downloading..." : "Download"}
            </Button>
          </div>
        </div>
      }
    >
      <div ref={sheetContentRef}>
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E5F4FF]">
              <Image
                src="/images/tch.png"
                alt="HMO service logo"
                width={64}
                height={64}
              />
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-[#111827]">
                {bill.provider}
              </span>
              <span className="text-xs text-[#6B7280]">
                {invoiceNumber || "—"}
              </span>
              <span className="text-xs text-[#6B7280]">
                {bill.dueDate} · Bill Review
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-sm font-medium pb-4 pt-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00B894]" />
            <span>Services</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#9B59B6]" />
            <span>Drugs</span>
          </div>
        </div>

        {/* Loading / Error */}
        {detailsQuery.isLoading && (
          <div className="text-sm text-[#667085]">
            Loading invoice details...
          </div>
        )}
        {detailsQuery.isError && (
          <div className="text-sm text-[#B42318]">
            {(detailsQuery.error as Error)?.message || "Failed to load details"}
          </div>
        )}

        {/* Table */}
        {!detailsQuery.isLoading && !detailsQuery.isError && (
          <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB]">
                  <TableHead className="w-[72px] text-xs">
                    {variant === "multi" ? "#" : "Encounter"}
                  </TableHead>
                  <TableHead className="text-xs">Encounter Date</TableHead>
                  <TableHead className="text-xs">Enrollee</TableHead>
                  <TableHead className="text-xs">Diagnosis</TableHead>
                  <TableHead className="text-xs">Code</TableHead>
                  <TableHead className="text-right text-xs">Cost</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {lines.map((line, idx) => {
                  const servicesTotal = line.services.reduce(
                    (s, x) => s + x.cost,
                    0
                  )
                  const drugsTotal =
                    line.drugs?.reduce((s, x) => s + x.cost, 0) ?? 0
                  const total = servicesTotal + drugsTotal

                  return (
                    <TableRow key={`${line.id}-${idx}`}>
                      <TableCell className="align-top text-xs">
                        {variant === "multi" ? idx + 1 : line.id}
                      </TableCell>
                      <TableCell className="align-top text-xs">
                        {line.encounterDate}
                      </TableCell>
                      <TableCell className="align-top text-xs">
                        <div className="flex flex-col">
                          <span className="text-[#111827]">
                            {line.enrolleeName}
                          </span>
                          <span className="text-[#667085]">
                            {line.enrolleeId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top whitespace-pre-line text-xs">
                        {line.diagnosis}
                      </TableCell>
                      <TableCell className="align-top text-xs">
                        {line.code}
                      </TableCell>
                      <TableCell className="align-top text-xs">
                        <div className="flex flex-col items-end gap-1">
                          {line.services.map((s) => (
                            <div
                              key={s.label}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: s.color }}
                              />
                              <span>{s.label}</span>
                              <span>{formatNaira(s.cost)}</span>
                            </div>
                          ))}
                          {line.drugs?.map((d) => (
                            <div
                              key={d.label}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: d.color }}
                              />
                              <span>{d.label}</span>
                              <span>{formatNaira(d.cost)}</span>
                            </div>
                          ))}
                          {variant === "multi" && (
                            <div className="mt-1 text-xs font-semibold">
                              {formatNaira(total)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {lines.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-sm text-[#9CA3AF]"
                    >
                      No billing details found for this invoice.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Totals + footer */}
        <div className="flex flex-col gap-8">
          <div className="ml-auto w-full max-w-xs text-sm">
            <div className="flex justify-between pb-2">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="font-medium text-[#111827]">
                {formatNaira(subtotal)}
              </span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-[#6B7280]">Tax (10%)</span>
              <span className="font-medium text-[#111827]">
                {formatNaira(tax)}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-[#E5E7EB] pt-3">
              <span className="font-semibold text-[#111827]">Total due</span>
              <span className="font-semibold text-[#2563EB]">
                {formatNaira(totalDue)}
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[12px]/[15.84px] text-[#1A1C21] font-medium tracking-normal mb-3">
                Pay to:
              </p>
              <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
                1234567890
              </p>
              <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
                Zenith Bank Plc
              </p>
              <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
                Hospital XYZ
              </p>
              <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal mt-8">
                Thank you!
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-[12px]/[15.84px] text-[#1A1C21] font-medium tracking-normal mb-3">
                Approved by:
              </p>
              <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
                John Doe
              </p>
              <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
                HMO Manager
              </p>
              <p className="text-[14px]/[16px] text-[#344054] font-hnd font-normal tracking-normal">
                12 December 2024
              </p>
              <div className="flex justify-end items-end mt-8">
                <SignatureIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomSheet>
  )
}
