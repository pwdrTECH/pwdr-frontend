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

export type UtilRow = {
  id: string
  enrolleeName: string
  enrolleeId: string
  scheme: string
  plan: string
  provider: string
  providerExtraCount?: number
  location: string
  utilization: number
  usedPct: number
  balance: number
}

function naira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function UtilizationEnrolleeTable({ rows }: { rows: UtilRow[] }) {
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)

  const totalItems = rows?.length ?? 0
  const start = (page - 1) * pageSize
  const slice = rows.slice(start, start + pageSize)

  const controlsId = "report-util-by-enrollee-table-body"

  return (
    <div className="px-6 pt-2">
      <div className="mt-3 w-full overflow-hidden rounded-[12px] border border-[#EEF0F5] bg-white">
        <TableContainer>
          <Table className="min-w-[920px]">
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-[240px]">Enrollee</TableHead>
                <TableHead className="w-[120px]">Scheme</TableHead>
                <TableHead className="w-[120px]">Plan</TableHead>
                <TableHead className="w-[220px]">Provider</TableHead>
                <TableHead className="w-[120px]">Location</TableHead>
                <TableHead className="w-[160px]">Cost</TableHead>
                <TableHead className="w-[120px]">Utilization</TableHead>
                <TableHead className="w-[160px]">Balance</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {slice.map((r) => (
                <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <div className="font-hnd font-medium text-[16px]/[24px] text-[#293347]">
                        {r.enrolleeName}
                      </div>
                      <div className="text-[14px]/[16px] font-hnd font-normal tracking-normal text-[#636E7D]">
                        {r.enrolleeId}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-[#475467]">{r.scheme}</TableCell>
                  <TableCell className="text-[#475467]">{r.plan}</TableCell>

                  <TableCell className="text-[#475467]">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[150px]">
                        {r.provider}
                      </span>
                      {!!r.providerExtraCount && (
                        <span className="inline-flex items-center rounded-full bg-[#F2F4F7] px-2 py-0.5 text-[12px] text-[#475467]">
                          +{r.providerExtraCount}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-[#475467]">{r.location}</TableCell>

                  <TableCell className="text-[#475467]">
                    {naira(r.utilization)}
                  </TableCell>

                  <TableCell className="text-[#349E57]">{r.usedPct}%</TableCell>

                  <TableCell className="text-[#475467]">
                    {naira(r.balance)}
                  </TableCell>
                </TableRow>
              ))}

              {slice.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
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
