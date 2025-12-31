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

import type { ProviderRow } from "./mock"

type Props = {
  rows: ProviderRow[]
  page: number
  onPageChange: (p: number) => void
  totalItems: number
  pageSize: number
  loading?: boolean
  error?: string
}

export function ProviderTable({
  rows,
  page,
  onPageChange,
  totalItems,
  pageSize,
  loading,
  error,
}: Props) {
  const controlsId = "report-provider-table-body"

  return (
    <div className="px-6 pt-4">
      <div className="mt-3 w-full overflow-hidden rounded-[12px] border bg-white">
        <TableContainer>
          <Table className="min-w-[920px]">
            <TableHeader className="bg-[#F9FAFB]">
              <TableRow>
                <TableHead className="w-[260px]">Hospital</TableHead>
                <TableHead className="w-[140px]">Provider Code</TableHead>
                <TableHead className="w-[140px]">Total Requests</TableHead>
                <TableHead className="w-[120px]">Approved</TableHead>
                <TableHead className="w-[120px]">Denied</TableHead>
                <TableHead className="w-[140px]">Approval Rate</TableHead>
                <TableHead className="w-[180px] text-right">
                  Est. Cost
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading && error && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-red-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                !error &&
                rows.map((r) => (
                  <TableRow key={r.id} className="border-t">
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <div className="font-medium text-[#293347]">
                          {r.providerName}
                        </div>
                        <div className="text-sm text-[#667085]">
                          {r.providerCode}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-[#475467]">
                      {r.providerCode}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {r.totalRequests}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {r.approved}
                    </TableCell>
                    <TableCell className="text-[#475467]">{r.denied}</TableCell>
                    <TableCell className="text-[#475467]">
                      {r.approvalRate}%
                    </TableCell>
                    <TableCell className="text-right text-[#475467]">
                      ₦ {Number(r.estimatedCost || 0).toLocaleString("en-NG")}
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && !error && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-gray-500"
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
