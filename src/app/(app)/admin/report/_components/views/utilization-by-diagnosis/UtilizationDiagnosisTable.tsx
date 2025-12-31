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

export type DiagnosisRow = {
  id: string
  diagnosis: string
  provider: string
  timesDiagnosed: number
  enrolleeCount: number
  cost: number

  // filters (optional)
  service?: string
  location?: string
  scheme?: string
  plan?: string
}

type Props = {
  rows: DiagnosisRow[]

  /** server pagination (optional) */
  page?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  pageSize?: number

  /** optional UI state */
  loading?: boolean
  error?: string

  /** optional date labels for the "From/To" line */
  fromLabel?: string
  toLabel?: string
}

function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

export function UtilizationDiagnosisTable({
  rows,
  page: pageProp,
  onPageChange,
  totalItems: totalItemsProp,
  pageSize: pageSizeProp,
  loading,
  error,
  fromLabel = "—",
  toLabel = "—",
}: Props) {
  const isServer =
    typeof pageProp === "number" && typeof onPageChange === "function"

  // ✅ local fallback pagination (only when parent doesn't provide server props)
  const [pageState, setPageState] = React.useState(1)
  const [pageSizeState] = React.useState(10)

  const page = isServer ? (pageProp as number) : pageState
  const setPage = isServer
    ? (onPageChange as (p: number) => void)
    : setPageState
  const pageSize = isServer ? pageSizeProp ?? 20 : pageSizeState

  const totalItems = totalItemsProp ?? rows.length

  // ✅ slice only in local mode; server mode expects rows already paged
  const slice = React.useMemo(() => {
    if (isServer) return rows
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, isServer, page, pageSize])

  // ✅ prevent blank page when filters reduce local rows
  React.useEffect(() => {
    if (isServer) return
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    if (page > totalPages) setPageState(1)
  }, [isServer, totalItems, pageSize, page])

  const controlsId = "report-utilization-diagnosis-table-body"

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
                <TableHead className="w-[360px]">Diagnosis</TableHead>
                <TableHead className="w-[280px]">Provider</TableHead>
                <TableHead className="w-[160px]">Times Diagnoses</TableHead>
                <TableHead className="w-[160px]">No. of Enrollees</TableHead>
                <TableHead className="w-[160px] text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody id={controlsId}>
              {loading && slice.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading && error && slice.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm text-red-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                !error &&
                slice.map((r) => (
                  <TableRow key={r.id} className="border-t border-[#EEF0F5]">
                    <TableCell className="pl-6 text-[#475467]">
                      {r.diagnosis}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {r.provider}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {Number(r.timesDiagnosed ?? 0).toLocaleString("en-NG")}
                    </TableCell>
                    <TableCell className="text-[#475467]">
                      {Number(r.enrolleeCount ?? 0).toLocaleString("en-NG")}
                    </TableCell>
                    <TableCell className="text-right text-[#475467] pr-6">
                      {fmtNaira(r.cost)}
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && !error && slice.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
