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
import * as React from "react"
import type { UtilServiceRow } from "./mock"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function ServiceTable({ rows }: { rows: UtilServiceRow[] }) {
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  const totalItems = rows?.length ?? 0
  const start = (page - 1) * pageSize
  const slice = rows.slice(start, start + pageSize)

  const controlsId = "report-util-service-table-body"

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
          <Table className="min-w-[920px]">
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-[140px]">Services</TableHead>
                <TableHead className="w-[220px]">Enrollee Name</TableHead>
                <TableHead className="w-[160px]">Request ID</TableHead>
                <TableHead className="w-[240px]">Provider</TableHead>
                <TableHead className="w-[140px]">Location</TableHead>
                <TableHead className="w-[160px] text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {slice.map((r) => (
                <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                  <TableCell className="text-[#475467]">{r.service}</TableCell>
                  <TableCell className="pl-6">
                    <div className="font-hnd font-medium text-[16px]/[24px] text-[#293347]">
                      {r.enrolleeName}
                    </div>
                  </TableCell>
                  <TableCell className="text-[#475467]">
                    {r.requestId}
                  </TableCell>
                  <TableCell className="text-[#475467]">{r.provider}</TableCell>
                  <TableCell className="text-[#475467]">{r.location}</TableCell>
                  <TableCell className="text-right text-[#475467] pr-6">
                    {fmtNaira(r.cost)}
                  </TableCell>
                </TableRow>
              ))}

              {slice.length === 0 && (
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
