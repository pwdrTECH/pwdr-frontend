/* ========================================================================
   FILE: app/(dashboard)/billing/page.tsx  (your BillingPage)
   - Fixes:
     1) store invoiceNumber from API (not BILL-1)
     2) Mark As Paid: loader + toast + don't close dialog on error
======================================================================== */

"use client"

import { DateRangePicker } from "@/components/filters/date-range"
import { SearchField } from "@/components/filters/search"
import { FilterSelect } from "@/components/filters/select"
import TablePagination from "@/components/table/pagination"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useBilling, useSetInvoicePaid } from "@/lib/api/billing"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { BulkClaimAnalysisSheet } from "./_components/BulkClaimAnalysis"
import { BillDetailSheet } from "./_components/detail"
import { UploadBulkClaimSheet } from "./_components/UploadBulkClaimSheet"
import { ConfirmDialog } from "@/components/overlays/ConfirmDialog"
import { toast } from "sonner"

/** ============================
 *  Types (UI)
 ============================ */

export type BillStatus = "all" | "paid" | "unpaid"

export interface BillingRow {
  id: string
  dueDate: string
  billId: string
  provider: string
  claimsCount: number
  totalCost: number
  status: BillStatus
  invoiceNumber: string
}

/** ============================
 *  Helpers
 ============================ */

const formatNaira = (v: number) =>
  `₦${Number(v || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}`

function formatDateLabel(value?: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function parsePriceRange(price: string): {
  min_cost: string
  max_cost: string
} {
  if (!price || price === "all") return { min_cost: "", max_cost: "" }
  if (price.endsWith("+"))
    return { min_cost: price.replace("+", ""), max_cost: "" }
  const [min, max] = price.split("-")
  return { min_cost: min ?? "", max_cost: max ?? "" }
}

const PAGE_SIZE = 10

export default function BillingPage() {
  const [search, setSearch] = useState("")
  const [provider, setProvider] = useState<string>("all")
  const [price, setPrice] = useState<string>("all")
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [status, setStatus] = useState<"all" | BillStatus>("all")
  const [page, setPage] = useState(1)

  const [payDialogOpenFor, setPayDialogOpenFor] = useState<string | null>(null)
  const [payingRowId, setPayingRowId] = useState<string | null>(null)
  const [selectedBill, setSelectedBill] = useState<BillingRow | null>(null)
  const [detailVariant, setDetailVariant] = useState<"single" | "multi">(
    "single"
  )

  const setPaid = useSetInvoicePaid()
  const [showBulkSheet, setShowBulkSheet] = useState(false)
  const [showResultSheet, setShowResultSheet] = useState(false)

  const pageSize = 10
  const controlsId = "billing-table-body"
  const priceRange = useMemo(() => parsePriceRange(price), [price])

  const billingFilters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      start_date: startDate ?? "",
      end_date: endDate ?? "",
      provider_id: provider === "all" ? "" : provider,
      min_cost: priceRange.min_cost,
      max_cost: priceRange.max_cost,
      status: status === "all" ? "" : status,
    }),
    [page, startDate, endDate, provider, priceRange, status]
  )

  const billingQuery = useBilling(billingFilters)

  const summary = billingQuery.data?.data?.summary
  const pagination = billingQuery.data?.data?.pagination
  const apiRows = billingQuery.data?.data?.line_listing ?? []

  const rows: BillingRow[] = useMemo(() => {
    const q = search.trim().toLowerCase()

    const mapped = apiRows.map((b, index) => {
      const mappedStatus: BillStatus = b.status === "paid" ? "paid" : "unpaid"
      const invoiceNumber = String(b.invoice_number ?? "").trim()
      const displayBillId = invoiceNumber || `BILL-${index + 1}`

      return {
        id: `${b.provider_name ?? "provider"}-${b.due_date ?? "date"}-${index}`,
        dueDate: formatDateLabel(b.due_date),
        billId: displayBillId,
        provider: String(b.provider_name ?? ""),
        claimsCount: Number(b.no_of_claims || 0),
        totalCost: Number(b.total_cost || 0),
        status: mappedStatus,
        invoiceNumber,
      }
    })

    if (!q) return mapped

    return mapped.filter(
      (r) =>
        r.billId.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q)
    )
  }, [apiRows, search])

  const totalItems =
    typeof pagination?.total === "number" ? pagination.total : rows.length
  const effectivePageSize =
    typeof pagination?.per_page === "number" ? pagination.per_page : pageSize

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div />

        <div className="w-full max-w-[575px] bg-white h-18.5 flex justify-between rounded-[12px] border pt-3.5 pb-4 pl-3.5 pr-5 items-center">
          <div className="h-11 w-full flex flex-col">
            <span className="text-sm font-hnd font-medium font-base tracking-normal text-[#101928]">
              Analyze Bulk Claim
            </span>
            <span className="text-sm text-[#5E697B] font-hnd font-normal tracking-normal">
              Upload bulk request for AI Analytics and processing
            </span>
          </div>
          <UploadBulkClaimSheet
            openResultSheet={showResultSheet}
            onOpenResultChange={setShowResultSheet}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <SummaryCard
          label="Bills due"
          value={formatNaira(summary?.total_bills_due ?? 0)}
          valueClass="text-[#FF6058]"
        />
        <SummaryCard
          label="Bills paid"
          value={formatNaira(summary?.total_bills_paid ?? 0)}
        />
        <SummaryCard
          label="Total number of bills"
          value={String(summary?.number_of_bills ?? 0)}
        />
        <SummaryCard
          label="Total amount of bills"
          value={formatNaira(summary?.total_cost_of_bills ?? 0)}
        />
      </div>

      {/* Table card */}
      <Card className="border border-[#EAECF0] rounded-[16px] shadow-none">
        <CardHeader className="border-b border-[#EAECF0] pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SearchField
                onChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
              />

              <div className="flex flex-wrap items-center gap-4 justify-end">
                <FilterSelect
                  value={provider}
                  onChange={(v) => {
                    setProvider(v)
                    setPage(1)
                  }}
                  placeholder="All Providers"
                  options={[
                    { value: "all", label: "All Providers" },
                    { value: "Primus Hospital", label: "Primus Hospital" },
                  ]}
                />

                <FilterSelect
                  value={price}
                  onChange={(v) => {
                    setPrice(v)
                    setPage(1)
                  }}
                  placeholder="₦0 - ₦999999999"
                  options={[
                    { value: "all", label: "All Prices" },
                    { value: "0-999999999", label: "₦0 - ₦999999999" },
                    {
                      value: "1000000-5000000",
                      label: "₦1,000,000 - ₦5,000,000",
                    },
                    { value: "5000000+", label: "₦5,000,000+" },
                  ]}
                />

                <FilterSelect
                  value={status}
                  onChange={(v) => {
                    setStatus(v as BillStatus)
                    setPage(1)
                  }}
                  placeholder="Any status"
                  options={[
                    { value: "all", label: "Any Status" },
                    { value: "unpaid", label: "Unpaid" },
                    { value: "paid", label: "Paid" },
                  ]}
                />

                <DateRangePicker
                  onChange={(start, end) => {
                    setStartDate(start)
                    setEndDate(end)
                    setPage(1)
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <TableContainer>
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>No. of Claims</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody id={controlsId}>
                {billingQuery.isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-[#9CA3AF]"
                    >
                      Loading bills...
                    </TableCell>
                  </TableRow>
                )}

                {billingQuery.isError && !billingQuery.isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-[#B42318]"
                    >
                      {(billingQuery.error as Error)?.message ||
                        "Failed to load billing"}
                    </TableCell>
                  </TableRow>
                )}

                {!billingQuery.isLoading &&
                  !billingQuery.isError &&
                  rows.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.dueDate}</TableCell>
                      <TableCell>{row.billId}</TableCell>
                      <TableCell>{row.provider}</TableCell>
                      <TableCell>{row.claimsCount.toLocaleString()}</TableCell>
                      <TableCell>{formatNaira(row.totalCost)}</TableCell>

                      <TableCell>
                        {row.status === "paid" ? (
                          <Badge className="w-fit h-[21px] rounded-[6px] bg-[#1671D91A] text-[#1671D9] text-[12px]/[18px] font-bold tracking-normal border border-[#0000001A] shadow-[0px_1px_2px_0px_#1018280D] p-1.5">
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="w-fit h-[21px] rounded-[6px] bg-transparent text-[#979797] text-[12px]/[18px] font-bold tracking-normal border border-[#979797] shadow-[0px_1px_2px_0px_#1018280D] p-1.5">
                            Unpaid
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right space-x-4">
                        <button
                          type="button"
                          className="text-[#1671D9] text-sm font-bold font-hnd tracking-normal cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedBill(row)
                            setDetailVariant(idx % 2 === 0 ? "single" : "multi")
                          }}
                        >
                          Review
                        </button>
                        {row.status === "unpaid" ? (
                          <ConfirmDialog
                            variant="info"
                            title="Mark As Paid?"
                            description="Are you sure you want to mark this invoice as paid?"
                            confirmText={
                              payingRowId === row.id
                                ? "Processing..."
                                : "Yes, proceed"
                            }
                            cancelText="Cancel"
                            open={payDialogOpenFor === row.id}
                            onOpenChange={(open) => {
                              if (payingRowId === row.id) return
                              setPayDialogOpenFor(open ? row.id : null)
                            }}
                            onConfirm={async () => {
                              const invoiceNumber = row.invoiceNumber

                              if (!invoiceNumber) {
                                toast.error(
                                  "Missing invoice number for this bill"
                                )
                                return
                              }

                              setPayingRowId(row.id)

                              const toastId = `mark-paid-${invoiceNumber}`
                              toast.loading("Marking invoice as paid...", {
                                id: toastId,
                              })

                              try {
                                const res = await setPaid.mutateAsync(
                                  invoiceNumber
                                )

                                toast.success(
                                  res?.message ||
                                    "Invoice marked as paid successfully",
                                  { id: toastId }
                                )

                                setPayDialogOpenFor(null)
                              } catch (e: any) {
                                toast.error(
                                  e?.message ||
                                    "Failed to mark invoice as paid",
                                  {
                                    id: toastId,
                                  }
                                )
                              } finally {
                                setPayingRowId(null)
                              }
                            }}
                            trigger={
                              <button
                                type="button"
                                className="text-[#1671D9] text-sm font-bold font-hnd tracking-normal cursor-pointer hover:underline"
                                onClick={() => setPayDialogOpenFor(row.id)}
                              >
                                Mark As Paid
                              </button>
                            }
                          />
                        ) : (
                          <button
                            type="button"
                            className="text-[#1671D9] text-sm font-bold font-hnd tracking-normal cursor-pointer hover:underline"
                          >
                            View
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                {!billingQuery.isLoading &&
                  !billingQuery.isError &&
                  rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-12 text-center text-sm text-[#9CA3AF]"
                      >
                        No bills found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="border-t border-[#EAECF0]">
            <TablePagination
              page={pagination?.current_page ?? page}
              onPageChange={setPage}
              totalItems={totalItems}
              pageSize={effectivePageSize}
              boundaryCount={1}
              siblingCount={1}
              controlsId={controlsId}
            />
          </div>
        </CardContent>
      </Card>

      {selectedBill && (
        <BillDetailSheet
          open={!!selectedBill}
          onOpenChange={(open) => {
            if (!open) setSelectedBill(null)
          }}
          bill={selectedBill}
          variant={detailVariant}
        />
      )}

      <BulkClaimAnalysisSheet
        open={showBulkSheet}
        onOpenChange={setShowBulkSheet}
        onShowResult={() => {
          setShowBulkSheet(false)
          setShowResultSheet(true)
        }}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <Card className="h-31 rounded-[12px] border border-[#EAECF0] shadow-none p-4">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-5">
          <span className="font-hnd font-medium text-sm tracking-tight text-[#7A7A7A]">
            {label}
          </span>
          <span
            className={cn(
              "font-hnd font-bold text-[24px]/[40px] tracking-[-0.02em] text-[#101928]",
              valueClass
            )}
          >
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
