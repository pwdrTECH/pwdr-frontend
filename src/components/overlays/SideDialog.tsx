"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type CustomSheetProps = {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  trigger: React.ReactElement
  children: React.ReactNode // scroll area
  footer?: React.ReactNode // fixed footer
  contentClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CustomSheet({
  title,
  subtitle,
  trigger,
  children,
  footer,
  contentClassName,
  open,
  onOpenChange,
}: CustomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      {/* Ensure overlay is below content but above the page */}
      <SheetOverlay className="z-[150]" />

      <SheetContent
        side="right"
        className={cn(
          // higher than overlay so popovers with z-[200+] can sit above if needed
          "fixed right-0 top-0 z-[200] m-0 h-full w-auto rounded-none border-0 p-0",
          "bg-white shadow-[0px_8.53px_8.53px_-4.27px_#10182808,0px_21.33px_25.6px_-4.27px_#10182814]",
          "outline-none overflow-hidden flex flex-col"
        )}
      >
        {(title || subtitle) && (
          <>
            <SheetHeader className="px-6 gap-[4.27px]">
              {title ? <SheetTitle>{title}</SheetTitle> : null}
              {subtitle ? (
                <SheetDescription>{subtitle}</SheetDescription>
              ) : null}
            </SheetHeader>
            <div className="my-5 h-px w-full bg-[#EAECF0]" />
          </>
        )}

        {/* Scrollable body */}
        <div className={cn("flex-1 overflow-y-auto", contentClassName)}>
          {children}
        </div>

        {/* Fixed footer */}
        {footer ? (
          <div className="border-t border-[#EAECF0] bg-white">
            <div className="flex items-center justify-end gap-3 px-6 py-4">
              {footer}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
