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
  cost: number
  utilizationRate: number
  balance: number
}

function naira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function pct(n: number) {
  const v = Number.isFinite(n) ? n : 0
  return `${Math.round(v)}%`
}

type Props = {
  rows: UtilRow[]

  /** server pagination */
  page?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  pageSize?: number

  loading?: boolean
  error?: string
}

export function UtilizationEnrolleeTable({
  rows,
  page: pageProp,
  onPageChange,
  totalItems: totalItemsProp,
  pageSize: pageSizeProp,
  loading,
  error,
}: Props) {
  const isServerPaginated =
    typeof pageProp === "number" &&
    typeof onPageChange === "function" &&
    typeof totalItemsProp === "number" &&
    typeof pageSizeProp === "number"

  // local fallback (only used if server pagination props aren't provided)
  const [localPage, setLocalPage] = React.useState(1)
  const [localPageSize] = React.useState(10)

  const page = isServerPaginated ? pageProp : localPage
  const setPage = isServerPaginated ? onPageChange : setLocalPage
  const pageSize = isServerPaginated ? pageSizeProp : localPageSize
  const totalItems = isServerPaginated ? totalItemsProp : rows.length

  // ✅ only slice when NOT server paginated
  const slice = React.useMemo(() => {
    if (isServerPaginated) return rows
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, isServerPaginated, page, pageSize])

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
              {error && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-red-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!error && loading && slice.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!error &&
                slice.map((r) => (
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

                    <TableCell className="text-[#475467]">
                      {r.location}
                    </TableCell>

                    <TableCell className="text-[#475467]">
                      {naira(r.cost)}
                    </TableCell>

                    <TableCell className="text-[#349E57]">
                      {pct(r.utilizationRate)}
                    </TableCell>

                    <TableCell className="text-[#475467]">
                      {naira(r.balance)}
                    </TableCell>
                  </TableRow>
                ))}

              {!error && !loading && slice.length === 0 && (
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
