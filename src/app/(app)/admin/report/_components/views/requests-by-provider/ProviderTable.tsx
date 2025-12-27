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
import type { ProviderRow } from "./RequestsByProviderView"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function fmtNaira(n: number) {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`
}

function initials(name: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : parts[0]?.[1] ?? ""
  return (first + second).toUpperCase() || "HP"
}

type Props = {
  rows: ProviderRow[]
}

export function ProviderTable({ rows }: Props) {
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  const totalItems = rows?.length ?? 0
  const start = (page - 1) * pageSize
  const slice = rows.slice(start, start + pageSize)

  const controlsId = "report-provider-table-body"

  React.useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    if (page > totalPages) setPage(totalPages)
  }, [page, pageSize, totalItems])

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
                <TableHead className="w-[360px]">Hospital + ID</TableHead>
                <TableHead className="w-[140px]">Total Request</TableHead>
                <TableHead className="w-[120px]">Approved</TableHead>
                <TableHead className="w-[120px]">Denied</TableHead>
                <TableHead className="w-[140px]">Approval rate</TableHead>
                <TableHead className="w-[180px] text-right">
                  Total Est. Cost
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {slice.map((r) => (
                <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {/* If you later have logos per provider, set r.logoUrl and use it here */}
                        <AvatarImage
                          src={(r as any).logoUrl ?? "/providers-avatar.png"}
                          alt={r.providerName}
                        />
                        <AvatarFallback className="bg-[#0B74B8] text-white font-hnd font-semibold">
                          {initials(r.providerName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <div className="font-hnd font-medium text-[16px]/[24px] text-[#293347]">
                          {r.providerName}
                        </div>
                        <div className="text-[14px]/[16px] font-hnd font-normal tracking-normal text-[#636E7D] flex items-center">
                          <span className="h-[6px] w-[6px] text-[#E3E3E3]">
                            &#183;
                          </span>
                          {r.providerCode}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-[#475467]">
                    {Number(r.totalRequests ?? 0).toLocaleString("en-NG")}
                  </TableCell>

                  <TableCell className="text-[#475467]">
                    {Number(r.approved ?? 0).toLocaleString("en-NG")}
                  </TableCell>

                  <TableCell className="text-[#475467]">
                    {Number(r.denied ?? 0).toLocaleString("en-NG")}
                  </TableCell>

                  <TableCell className="text-[#475467]">
                    {Math.round(Number(r.approvalRate ?? 0))}%
                  </TableCell>

                  <TableCell className="text-right text-[#475467] pr-6">
                    {fmtNaira(r.estimatedCost)}
                  </TableCell>
                </TableRow>
              ))}

              {slice.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    No providers found.
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
