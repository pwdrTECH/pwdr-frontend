import React from "react"

export interface TableProps {
  children: string | React.ReactNode
}
export function TableTitle({ children }: TableProps) {
  return (
    <div className="text-[18px]/[28px] tracking-normal font-hnd font-bold text-[#344054]">
      {children}
    </div>
  )
}
