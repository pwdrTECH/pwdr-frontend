"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { EMRRequest } from "./types"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import TablePagination from "@/components/table-pagination"
import ProcessRequest from "./process"

/**
 * RequestsTable — uses the shared <Pagination /> component.
 *
 * Props:
 *  - rows: EMRRequest[]
 *  - pageSize: initial items per page (default 10)
 */
export function RequestsTable({
  rows,
  pageSize = 10,
}: {
  rows: EMRRequest[]
  pageSize?: number
}) {
  // Pagination state (controlled locally)
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(pageSize)

  // Recompute/clamp page if inputs change
  const totalItems = rows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, limit)))

  React.useEffect(() => {
    setLimit(pageSize)
  }, [pageSize])

  React.useEffect(() => {
    // Reset to 1 whenever data or limit changes
    setPage(1)
  }, [rows, limit])

  React.useEffect(() => {
    // Clamp page if it ever drifts past bounds
    if (page > totalPages) setPage(totalPages)
    if (page < 1) setPage(1)
  }, [page, totalPages])

  // Compute current slice
  const start = (page - 1) * limit
  const slice = React.useMemo(
    () => rows.slice(start, start + limit),
    [rows, start, limit]
  )

  // “Process” action owned by table (opens sheet)
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<EMRRequest | null>(null)
  const handleProcess = (row: EMRRequest) => {
    setSelected(row)
    setOpen(true)
  }

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        {/* Match providers table sizing and feel */}
        <Table id="requests-table" className="min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">S/N</TableHead>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead className="w-[20%]">First Name</TableHead>
              <TableHead className="w-[20%]">Last Name</TableHead>
              <TableHead className="w-[25%]">HMO</TableHead>
              <TableHead className="w-[20%]">Created By</TableHead>
              <TableHead className="w-[10%] pr-6 text-right"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {slice.map((r) => (
              <TableRow key={r.id} className="hover:bg-[#F9FAFB]">
                <TableCell className="pl-6">{r.sn}</TableCell>
                <TableCell className="text-[#101828]">
                  {r.dateDisplay}
                </TableCell>
                <TableCell className="font-medium text-[#101828]">
                  {r.patientFirst}
                </TableCell>
                <TableCell>{r.patientLast}</TableCell>
                <TableCell className="text-[#374151]">{r.hmo}</TableCell>
                <TableCell className="text-[#374151]">{r.createdBy}</TableCell>
                <TableCell className="pr-6 text-right">
                  {r.status === "Process" ? (
                    <ProcessRequest />
                  ) : (
                    <Button
                      variant="ghost"
                      className="text-[#979797] text-[14px]/[20px] tracking-normal font-bold p-0 justify-start"
                    >
                      Processed
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {slice.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No requests match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer — shared component with summary + page-size */}
      <TablePagination
        page={page}
        onPageChange={setPage}
        totalItems={totalItems}
        pageSize={limit}
        controlsId="requests-table"
        className="px-4 py-3"
      />

      {/* Process sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-[520px] p-0">
          <div className="flex h-full flex-col">
            <div className="border-b px-6 py-5">
              <SheetHeader>
                <SheetTitle>Process Request</SheetTitle>
                <SheetDescription className="truncate">
                  {selected?.id}
                </SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {selected ? (
                <div className="space-y-3 text-[14px]">
                  <p>
                    <span className="text-[#6B7280]">Patient:&nbsp;</span>
                    <span className="font-medium text-[#0F172A]">
                      {selected.patientFirst} {selected.patientLast}
                    </span>
                  </p>
                  <p>
                    <span className="text-[#6B7280]">HMO:&nbsp;</span>
                    <span className="text-[#0F172A]">{selected.hmo}</span>
                  </p>
                  <p className="text-[#6B7280]">
                    Placeholder content — plug in your “Process Code” UI here.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="border-t bg-white px-6 py-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Process</Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
