"use client"

import TablePagination from "@/components/table/pagination"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { EnrolleeRow, Status } from "./types"

const STATUS_STYLES: Record<Status, string> = {
  Approved: "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]",
  Rejected: "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  Pending: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
}

type Props = {
  rows: EnrolleeRow[]
  page: number
  onPageChange: (p: number) => void
  totalItems: number
  pageSize: number
  fromLabel?: string
  toLabel?: string
  loading?: boolean
  error?: string
}

export function EnrolleeTable({
  rows,
  page,
  onPageChange,
  totalItems,
  pageSize,
  fromLabel = "—",
  toLabel = "—",
  loading,
  error,
}: Props) {
  const controlsId = "report-enrollee-table-body"

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
          <Table className="min-w-[920px]">
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-[220px]">Enrollee</TableHead>
                <TableHead className="w-[120px]">Plan</TableHead>
                <TableHead className="w-[120px]">Scheme</TableHead>
                <TableHead className="w-[240px]">Provider</TableHead>
                <TableHead className="w-[140px]">Request Date</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[140px] text-right">
                  Amount Claimed
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {/* Loading */}
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    Loading records...
                  </TableCell>
                </TableRow>
              )}

              {/* Error */}
              {!loading && error && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-[#B42318]"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {/* Rows */}
              {!loading &&
                !error &&
                rows.map((r) => (
                  <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <div className="font-hnd font-medium text-[16px]/[24px] text-[#293347]">
                          {r.enrolleeName}
                        </div>
                        <div className="text-[14px]/[16px] font-hnd font-normal tracking-normal text-[#636E7D] flex items-center">
                          <span className="h-[6px] w-[6px] text-[#E3E3E3]">
                            &#183;
                          </span>
                          {r.enrolleeId}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-[#475467]">{r.plan}</TableCell>
                    <TableCell className="text-[#475467]">{r.scheme}</TableCell>
                    <TableCell className="text-[#475467]">
                      {r.provider}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-[#475467]">
                        <span>{r.requestDate}</span>
                        <span className="text-[#667085]">{r.requestTime}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full px-3 py-1 text-[11px]/[16px] font-medium",
                          STATUS_STYLES[r.status]
                        )}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right text-[#475467]">
                      {r.amount}
                    </TableCell>
                  </TableRow>
                ))}

              {/* Empty */}
              {!loading && !error && rows.length === 0 && (
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
