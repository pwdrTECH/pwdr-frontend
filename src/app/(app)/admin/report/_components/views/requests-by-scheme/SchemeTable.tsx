"use client"

import * as React from "react"
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
import type { UtilSchemeRow } from "./mock"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function SchemeTable({ rows }: { rows: UtilSchemeRow[] }) {
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  const totalItems = rows?.length ?? 0
  const start = (page - 1) * pageSize
  const slice = rows.slice(start, start + pageSize)

  const controlsId = "report-utilization-by-scheme-table"

  return (
    <div className="px-6 pt-4">
      <div className="text-[12px]/[18px] text-[#667085]">
        <span className="mr-4">
          From: <span className="text-[#344054]">May, 2025</span>
        </span>
        <span>
          To: <span className="text-[#344054]">Sep, 2025</span>
        </span>
      </div>

      <div className="mt-3 w-full overflow-hidden rounded-[12px] border border-[#EEF0F5] bg-white">
        <TableContainer>
          <Table className="min-w-[980px]">
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-[120px]">Scheme</TableHead>
                <TableHead className="w-[170px]">Plan</TableHead>
                <TableHead className="w-[260px]">Enrollee Name</TableHead>
                <TableHead className="w-[160px]">Total Requests</TableHead>
                <TableHead className="w-[160px]">Total Cost</TableHead>
                <TableHead className="w-[170px]">
                  Avg. cost / Enrollee
                </TableHead>
                <TableHead className="w-[150px] text-right pr-6">
                  Approval Rate
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {slice.map((r) => (
                <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                  <TableCell className="pl-6 text-[#101828] font-medium">
                    {r.schemeLabel}
                  </TableCell>
                  <TableCell className="text-[#475467]">
                    {r.planLabel}
                  </TableCell>
                  <TableCell className="text-[#475467]">
                    {r.enrolleeName}
                  </TableCell>
                  <TableCell className="text-[#475467]">
                    {Number(r.totalRequests ?? 0).toLocaleString("en-NG")}
                  </TableCell>
                  <TableCell className="text-[#475467]">
                    {fmtNaira(r.totalCost)}
                  </TableCell>
                  <TableCell className="text-[#475467]">
                    {fmtNaira(r.avgCostPerEnrollee)}
                  </TableCell>
                  <TableCell className="text-right pr-6 text-[#475467]">
                    {r.approvalRateLabel}
                  </TableCell>
                </TableRow>
              ))}

              {slice.length === 0 && (
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
    </div>
  )
}
