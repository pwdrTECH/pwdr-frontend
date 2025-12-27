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
import type { OverdueRow } from "./mock"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function OverdueTable({ rows }: { rows: OverdueRow[] }) {
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  const totalItems = rows?.length ?? 0
  const start = (page - 1) * pageSize
  const slice = rows.slice(start, start + pageSize)

  const controlsId = "report-overdue-table"

  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [page, pageSize, totalItems])

  return (
    <div className="px-6 pt-4">
      {/* date range row like screenshot */}
      <div className="text-[12px]/[18px] text-[#667085]">
        <span className="mr-6">
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
                <TableHead className="w-[160px] pl-6">Request ID</TableHead>
                <TableHead className="w-[260px]">Enrollee Name</TableHead>
                <TableHead className="w-[220px]">Provider</TableHead>
                <TableHead className="w-[120px]">Scheme</TableHead>
                <TableHead className="w-[160px]">Submission Date</TableHead>
                <TableHead className="w-[140px]">Days Overdue</TableHead>
                <TableHead className="w-[160px] text-right pr-6">
                  Total Cost
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {slice.map((r) => (
                <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                  <TableCell className="pl-6 text-[#344054]">
                    {r.requestId}
                  </TableCell>
                  <TableCell className="text-[#344054]">
                    {r.enrolleeName}
                  </TableCell>
                  <TableCell className="text-[#475467]">{r.provider}</TableCell>
                  <TableCell className="text-[#475467]">
                    {r.schemeLabel}
                  </TableCell>

                  {/* two-line date/time like screenshot */}
                  <TableCell className="text-[#101828]">
                    <div className="flex flex-col">
                      <span>{r.submittedDate}</span>
                      <span className="text-[#667085]">{r.submittedTime}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-[#475467]">
                    {r.daysOverdue} Days
                  </TableCell>

                  <TableCell className="text-right pr-6 text-[#475467]">
                    {fmtNaira(r.totalCost)}
                  </TableCell>
                </TableRow>
              ))}

              {slice.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    No overdue records found.
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
