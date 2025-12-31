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
import type { OrgRow } from "./mock"

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}
function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function OrganizationTable({
  rows,
  page,
  onPageChange,
  totalItems,
  pageSize,
  loading,
  error,
  fromLabel,
  toLabel,
}: {
  rows: OrgRow[]
  page: number
  onPageChange: (page: number) => void
  totalItems: number
  pageSize: number
  loading?: boolean
  error?: string
  fromLabel?: string
  toLabel?: string
}) {
  const controlsId = "report-org-table-body"

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
        <TableContainer>
          <Table className="min-w-[980px]">
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-[220px]">Organization</TableHead>
                <TableHead className="w-[150px]">Enrollee Count</TableHead>
                <TableHead className="w-[120px]">Requests</TableHead>
                <TableHead className="w-[140px]">Total Cost</TableHead>
                <TableHead className="w-[160px]">
                  Avg. cost / Enrollee
                </TableHead>
                <TableHead className="w-[140px]">Premium Pool</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading && !!error && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-red-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                !error &&
                rows.map((r) => (
                  <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                    <TableCell className="pl-6">
                      <div className="font-hnd font-medium text-[16px]/[24px] text-[#293347]">
                        {r.organization}
                      </div>
                    </TableCell>

                    <TableCell className="text-[#475467]">
                      {fmtInt(r.enrolleeCount)}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {fmtInt(r.requests)}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {fmtNaira(r.totalCost)}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {fmtNaira(r.avgCostPerEnrollee)}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {fmtNaira(r.premiumPool)}
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && !error && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
