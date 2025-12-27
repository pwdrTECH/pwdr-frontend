"use client"

import { cn } from "@/lib/utils"
import type { PropsWithChildren } from "react"

export function Card({ children }: PropsWithChildren) {
  return (
    <div className="w-full rounded-[16px] border border-[#EEF0F5] bg-white overflow-hidden">
      {children}
    </div>
  )
}

export function ToggleGroup() {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[#EAECF0] bg-white p-1">
      <ToggleBtn>Day</ToggleBtn>
      <ToggleBtn active>Month</ToggleBtn>
      <ToggleBtn>Year</ToggleBtn>
      <ToggleBtn>All</ToggleBtn>
    </div>
  )
}

export function ToggleBtn({
  children,
  active,
}: PropsWithChildren<{ active?: boolean }>) {
  return (
    <button
      type="button"
      className={cn(
        "h-7 rounded-full px-3 text-[12px]/[18px] transition",
        active
          ? "bg-[#F2F4F7] text-[#344054]"
          : "text-[#667085] hover:bg-[#F9FAFB]"
      )}
    >
      {children}
    </button>
  )
}

export function Th({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>
}

export function Td({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return <td className={cn("px-4 py-4 align-middle", className)}>{children}</td>
}
