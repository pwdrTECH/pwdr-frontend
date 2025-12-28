"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { ArrowLeft, ArrowRight } from "@/components/svgs"

export type TablePaginationProps = {
  page: number
  onPageChange: (page: number) => void
  /** Either pass totalPages or (totalItems + pageSize) */
  totalPages?: number
  totalItems?: number
  pageSize?: number
  boundaryCount?: number
  siblingCount?: number
  className?: string
  controlsId?: string
}

export default function TablePagination({
  page,
  onPageChange,
  totalPages: totalPagesProp,
  totalItems,
  pageSize = 10,
  boundaryCount = 1,
  siblingCount = 1,
  className,
  controlsId,
}: TablePaginationProps) {
  const totalPages = React.useMemo(() => {
    if (totalPagesProp && totalPagesProp > 0) return totalPagesProp
    if (typeof totalItems === "number")
      return Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)))
    return 1
  }, [totalPagesProp, totalItems, pageSize])

  const current = clamp(page, 1, totalPages)
  const canPrev = current > 1
  const canNext = current < totalPages

  const items = React.useMemo(
    () =>
      getPageItems({
        totalPages,
        currentPage: current,
        boundaryCount,
        siblingCount,
      }),
    [totalPages, current, boundaryCount, siblingCount]
  )

  const hasTotal = typeof totalItems === "number"
  const total = hasTotal ? totalItems : 0

  const start = hasTotal ? (current - 1) * pageSize + 1 : undefined
  const end = hasTotal ? Math.min(current * pageSize, total) : undefined

  function go(to: number) {
    const next = clamp(to, 1, totalPages)
    if (next !== current) onPageChange(next)
  }

  return (
    <div
      className={cn(
        "w-full h-[68px] flex items-center border-t border-[#EEF1F6] px-4 py-3",
        className
      )}
    >
      <UIPagination>
        <PaginationContent className="w-full flex items-center justify-between gap-2">
          {/* Left: range summary */}
          <div className="font-hnd font-medium text-[#475467] text-[14px]/[20px]">
            {hasTotal &&
            typeof start === "number" &&
            typeof end === "number" ? (
              <>
                Showing {start.toLocaleString()}–{end.toLocaleString()} of{" "}
                {total.toLocaleString()}
              </>
            ) : null}
          </div>

          {/* Center: page numbers */}
          <PaginationItem className="justify-self-center">
            <div className="flex items-center gap-2">
              {items.map((it, idx) =>
                it.type === "page" ? (
                  <PaginationLink
                    key={`p-${idx + 1}`}
                    href="#"
                    aria-controls={controlsId}
                    isActive={it.value === current}
                    className={cn(
                      "h-8 min-w-8 rounded-md px-2 font-hnd font-medium text-[14px]/[16px] tracking-normal text-[#182230] hover:text-[#182230] bg-white",
                      it.value === current && "bg-[#F5F5F5] hover:bg-[#F5F5F5]"
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      go(it.value)
                    }}
                  >
                    {it.value}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis key={`e-${idx + 1}`} />
                )
              )}
            </div>
          </PaginationItem>

          {/* Right: arrows */}
          <div className="flex items-center justify-end gap-2">
            <IconButton
              aria-label="Previous page"
              disabled={!canPrev}
              onClick={() => canPrev && go(current - 1)}
            >
              <ArrowLeft />
            </IconButton>
            <IconButton
              aria-label="Next page"
              disabled={!canNext}
              onClick={() => canNext && go(current + 1)}
            >
              <ArrowRight />
            </IconButton>
          </div>
        </PaginationContent>
      </UIPagination>
    </div>
  )
}

/* ---------------- helpers ---------------- */

function IconButton({
  children,
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: React.PropsWithChildren<{
  disabled?: boolean
  onClick?: () => void
  "aria-label": string
}>) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white",
        "text-[#111827]",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {children}
    </button>
  )
}

function getPageItems({
  totalPages,
  currentPage,
  boundaryCount,
  siblingCount,
}: {
  totalPages: number
  currentPage: number
  boundaryCount: number
  siblingCount: number
}): Array<{ type: "page"; value: number } | { type: "ellipsis" }> {
  const pages: number[] = []

  const startPages = range(1, Math.min(boundaryCount, totalPages))
  const endPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages
  )

  const siblingsStart = Math.max(
    Math.min(
      currentPage - siblingCount,
      totalPages - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  )

  const siblingsEnd = Math.min(
    Math.max(currentPage + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages[0] - 2
  )

  pages.push(...startPages)

  if (siblingsStart > boundaryCount + 2) pages.push(NaN)
  else if (boundaryCount + 1 < totalPages - boundaryCount)
    pages.push(boundaryCount + 1)

  pages.push(...range(siblingsStart, siblingsEnd))

  if (siblingsEnd < totalPages - boundaryCount - 1) pages.push(NaN)
  else if (totalPages - boundaryCount > boundaryCount)
    pages.push(totalPages - boundaryCount)

  pages.push(...endPages)

  return pages.map((p) =>
    Number.isNaN(p)
      ? { type: "ellipsis" as const }
      : { type: "page" as const, value: p }
  )
}

function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let i = start; i <= end; i++) out.push(i)
  return out
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
