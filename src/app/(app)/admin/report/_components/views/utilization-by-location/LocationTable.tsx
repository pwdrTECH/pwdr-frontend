"use client"

import TablePagination from "@/components/table/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type UtilizationLocationRow = {
  id: string
  location: string
  scheme: string
  provider: string
  plan: string
  claimsCover: number
  enrolleeCount: number
  approvedClaimsAmount: number
}

function toNumber(x: unknown) {
  if (typeof x === "number") return x
  const n = Number(String(x ?? "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

function fmtNaira(n: unknown) {
  return `₦ ${toNumber(n).toLocaleString("en-NG")}`
}

export function LocationTable({
  rows,
  page,
  pageSize,
  totalItems,
  onPageChange,
  loading,
  error,
  fromLabel,
  toLabel,
}: {
  rows: UtilizationLocationRow[]
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  loading?: boolean
  error?: string
  fromLabel?: string
  toLabel?: string
}) {
  const controlsId = "report-util-location-table-body"

  return (
    <div className="px-6 pt-4">
      <div className="text-[12px]/[18px] text-[#667085]">
        <span className="mr-4">
          From: <span className="text-[#344054]">{fromLabel ?? "—"}</span>
        </span>
        <span>
          To: <span className="text-[#344054]">{toLabel ?? "—"}</span>
        </span>
      </div>

      <div className="mt-3 w-full overflow-hidden rounded-[12px] border border-[#EEF0F5] bg-white">
        {/* allow horizontal scroll for the big table */}
        <div className="w-full overflow-x-auto">
          <TableContainer>
            <Table className="min-w-[920px]">
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow>
                  <TableHead className="w-[140px]">Location</TableHead>
                  <TableHead className="w-[120px]">Scheme</TableHead>
                  <TableHead className="w-[240px]">Provider</TableHead>
                  <TableHead className="w-[180px]">Plan</TableHead>
                  <TableHead className="w-[180px] text-right">
                    Claims Cover
                  </TableHead>
                  <TableHead className="w-[160px]">No. of Enrollees</TableHead>
                  <TableHead className="w-[180px] text-right">
                    Approved Claims
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody id={controlsId}>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-red-600"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : rows.length ? (
                  rows.map((r) => (
                    <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                      <TableCell className="text-[#475467]">
                        {r.location}
                      </TableCell>
                      <TableCell className="text-[#475467]">
                        {r.scheme}
                      </TableCell>
                      <TableCell className="text-[#475467]">
                        {r.provider}
                      </TableCell>
                      <TableCell className="text-[#475467]">{r.plan}</TableCell>
                      <TableCell className="text-right text-[#475467] pr-6">
                        {fmtNaira(r.claimsCover)}
                      </TableCell>
                      <TableCell className="text-[#475467]">
                        {toNumber(r.enrolleeCount).toLocaleString("en-NG")}
                      </TableCell>
                      <TableCell className="text-right text-[#475467] pr-6">
                        {fmtNaira(r.approvedClaimsAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <TablePagination
          page={page}
          onPageChange={onPageChange}
          totalItems={totalItems}
          pageSize={pageSize}
          boundaryCount={1}
          siblingCount={1}
          controlsId={controlsId}
        />
      </div>
    </div>
  )
}
