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

type Props = {
  rows: UtilSchemeRow[]

  /** ✅ for server pagination */
  page?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  pageSize?: number

  /** optional UI bits */
  loading?: boolean
  error?: string
  fromLabel?: string
  toLabel?: string
}

export function SchemeTable({
  rows,

  page: pageProp,
  onPageChange: onPageChangeProp,
  totalItems: totalItemsProp,
  pageSize: pageSizeProp,

  loading,
  error,
  fromLabel = "—",
  toLabel = "—",
}: Props) {
  // local pagination fallback
  const [localPage, setLocalPage] = React.useState(1)
  const [localPageSize] = React.useState(10)

  const isServerPaging =
    typeof pageProp === "number" &&
    typeof onPageChangeProp === "function" &&
    typeof totalItemsProp === "number"

  const page = isServerPaging ? pageProp ?? 1 : localPage
  const pageSize = isServerPaging ? pageSizeProp ?? 20 : localPageSize
  const totalItems = isServerPaging ? totalItemsProp ?? 0 : rows?.length ?? 0

  const slice = React.useMemo(() => {
    if (isServerPaging) return rows
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [isServerPaging, rows, page, pageSize])

  const controlsId = "report-utilization-by-scheme-table"

  return (
    <div className="px-6 pt-4">
      <div className="text-[12px]/[18px] text-[#667085]">
        <span className="mr-4">
          From: <span className="text-[#344054]">{fromLabel}</span>
        </span>
        <span>
          To: <span className="text-[#344054]">{toLabel}</span>
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
              ) : (
                <>
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
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          onPageChange={(next) => {
            if (isServerPaging) {
              onPageChangeProp?.(next)
            } else {
              setLocalPage(next)
            }
          }}
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
