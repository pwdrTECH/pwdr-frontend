"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CautionIcon } from "../svgs"

type Variant = "danger" | "warning" | "info"

export type ConfirmPopoverProps = {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  trigger?: React.ReactNode
  variant?: Variant
  title: React.ReactNode
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => Promise<void> | void
  onCancel?: () => void
  lockDuringConfirm?: boolean
  icon?: React.ReactNode
  contentClassName?: string
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
}

const VARIANT_STYLES: Record<
  Variant,
  { title: string; confirm: string; iconWrap: string; border: string }
> = {
  danger: {
    title: "text-[#B32318]",
    confirm: "bg-[#D92D20] hover:bg-[#D92D20]/90 text-white",
    iconWrap: "text-[#D92D20]",
    border: "border-[#D92D20]",
  },
  warning: {
    title: "text-[#B45309]",
    confirm: "bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white",
    iconWrap: "text-[#F59E0B]",
    border: "border-[#F59E0B]/40",
  },
  info: {
    title: "text-[#1D4ED8]",
    confirm: "bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white",
    iconWrap: "text-[#3B82F6]",
    border: "border-[#3B82F6]/40",
  },
}

export function ConfirmPopover({
  open: openProp,
  onOpenChange: onOpenChangeProp,
  trigger,
  variant = "danger",
  title,
  description,
  confirmText = "Yes, Continue",
  cancelText = "Close",
  onConfirm,
  onCancel,
  lockDuringConfirm = true,
  icon,
  contentClassName,
  side = "bottom",
  align = "end",
}: ConfirmPopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const controlled = typeof openProp === "boolean"
  const open = controlled ? openProp! : internalOpen

  const [busy, setBusy] = React.useState(false)
  const v = VARIANT_STYLES[variant]

  const safeSetOpen = React.useCallback(
    (next: boolean) => {
      if (next === false && lockDuringConfirm && busy) return
      if (controlled) onOpenChangeProp?.(next)
      else setInternalOpen(next)
    },
    [controlled, lockDuringConfirm, busy, onOpenChangeProp]
  )

  async function handleConfirm() {
    try {
      if (onConfirm) {
        const ret = onConfirm()
        if (ret instanceof Promise) {
          setBusy(true)
          await ret
        }
      }
      safeSetOpen(false)
    } finally {
      setBusy(false)
    }
  }

  function handleCancel() {
    onCancel?.()
    safeSetOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={safeSetOpen} modal={false}>
      {trigger ? (
        <PopoverTrigger asChild>
          <span
            className="inline-flex"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                safeSetOpen(true)
              }
            }}
          >
            {trigger}
          </span>
        </PopoverTrigger>
      ) : null}

      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        alignOffset={-2}
        collisionPadding={12}
        className={cn(
          "z-[220] w-[380px] rounded-3xl border bg-white px-4 py-[18px] shadow-lg",
          v.border,
          contentClassName
        )}
      >
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            {icon ?? <CautionIcon />}{" "}
            <h3 className={cn("text-[16px]/[22px] font-semibold", v.title)}>
              {title}
            </h3>
          </div>
          <div className="w-full ">{description ?? null}</div>
          <div className="w-full flex items-center justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={busy}
              className="h-[33.94px] rounded-xl border border-[#E5E7EB] bg-white px-3 font-semibold font-hnd tracking-normal text-[13.08px]/[18.68px] text-[#344054] hover:bg-[#F9FAFB]"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className={cn(
                "h-[33.94px] rounded-xl px-[13.08px] text-[14px] font-hnd font-semibold py-[7.47px] disabled:opacity-60 shadow-[0px_16px_18.8px_0px_#220F0F1F] cursor-pointer",
                v.confirm
              )}
            >
              {busy ? "Please wait…" : confirmText}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
