"use client"

import TablePagination from "@/components/table/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { UtilProviderRow } from "./mock"

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function ProviderTable({
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
  rows: UtilProviderRow[]
  page: number
  onPageChange: (p: number) => void
  totalItems: number
  pageSize: number
  loading?: boolean
  error?: string
  fromLabel?: string
  toLabel?: string
}) {
  const controlsId = "report-utilization-by-provider-table"

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
          <Table className="min-w-[920px]">
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-[340px]">Hospital + ID</TableHead>
                <TableHead className="w-[140px]">Location</TableHead>
                <TableHead className="w-[140px]">Patients Count</TableHead>
                <TableHead className="w-[120px]">Requests</TableHead>
                <TableHead className="w-[160px]">Total Cost</TableHead>
                <TableHead className="w-[160px] text-right">
                  Avg. cost / Enrollee
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-red-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((r) => (
                  <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={r.avatarUrl ?? ""}
                            alt={r.providerName}
                          />
                          <AvatarFallback className="bg-[#1671D9] text-white">
                            {r.providerName?.slice(0, 1)?.toUpperCase() ?? "P"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                          <div className="font-hnd font-medium text-[16px]/[24px] text-[#293347]">
                            {r.providerName}
                          </div>
                          <div className="text-[14px]/[16px] font-hnd font-normal tracking-normal text-[#636E7D]">
                            {r.providerCode}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-[#475467]">
                      {r.locationLabel}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {Number(r.patientsCount ?? 0).toLocaleString("en-NG")}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {Number(r.requests ?? 0).toLocaleString("en-NG")}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {fmtNaira(r.totalCost)}
                    </TableCell>
                    <TableCell className="text-right text-[#475467] pr-6">
                      {fmtNaira(r.avgCostPerEnrollee)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
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
