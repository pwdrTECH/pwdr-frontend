"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetOverlay,
  SheetPortal, // ✅ IMPORTANT
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { ReactElement, ReactNode } from "react"

type SheetPosition = "right" | "center" | "left"

type CustomSheetProps = {
  title?: ReactNode
  subtitle?: ReactNode
  trigger?: ReactElement
  children: ReactNode
  footer?: ReactNode
  closeIcon?: ReactNode
  contentClassName?: string
  panelClassName?: string
  position?: SheetPosition
  open?: boolean
  onOpenChange?: (open: boolean) => void

  /** Close button on overlay (outside panel) */
  overlayClose?: boolean
  overlayCloseClassName?: string
  overlayCloseIcon?: ReactNode
}

export function CustomSheet({
  title,
  subtitle,
  trigger,
  children,
  footer,
  contentClassName,
  panelClassName,
  position = "right",
  open,
  onOpenChange,
  overlayClose = false,
  closeIcon,
}: CustomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetPortal>
        <SheetOverlay className="z-[150]" />
        {overlayClose ? closeIcon : null}

        <SheetContent
          side={position === "left" ? "left" : "right"}
          className={cn(
            "fixed top-0 z-[200] m-0 h-full rounded-none border-0 p-0",
            "bg-white shadow-[0px_8.53px_8.53px_-4.27px_#10182808,0px_21.33px_25.6px_-4.27px_#10182814]",
            "outline-none overflow-hidden flex flex-col",
            position === "right" && "right-0",
            position === "left" && "left-0",
            position === "center" && "left-1/2 -translate-x-1/2",
            panelClassName
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

          <div className={cn("flex-1 overflow-y-auto", contentClassName)}>
            {children}
          </div>

          {footer ? (
            <div className="border-t border-[#EAECF0] bg-white">
              <div className="flex items-center justify-end gap-3 px-6 py-4">
                {footer}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </SheetPortal>
    </Sheet>
  )
}
