"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import * as React from "react"
import { CancelButton } from "../form/button"

type Variant = "danger" | "warning" | "info"

export type ConfirmDialogProps = {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  trigger?: React.ReactNode
  variant?: Variant
  title: React.ReactNode
  description?: React.ReactNode
  descriptionAsChild?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => Promise<void> | void
  onCancel?: () => void
  lockDuringConfirm?: boolean
  icon?: React.ReactNode
  button?: React.ReactNode
  contentClassName?: string
}

const VARIANT_STYLES: Record<
  Variant,
  { border: string; title: string; confirm: string; iconWrap: string }
> = {
  danger: {
    border: "border-[#E11D48]/40",
    title: "text-[#B42318]",
    confirm:
      "bg-[#D92D20] hover:bg-[#D92D20]/90 text-white focus:ring-[#D92D20]/30",
    iconWrap: "text-[#D92D20]",
  },
  warning: {
    border: "border-[#F59E0B]/40",
    title: "text-[#B45309]",
    confirm:
      "bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white focus:ring-[#F59E0B]/30",
    iconWrap: "text-[#F59E0B]",
  },
  info: {
    border: "border-[#EAECF0]",
    title: "text-[#333333]",
    confirm: "bg-primary hover:bg-primary/90 text-white focus:ring-primary/30",
    iconWrap: "text-primary",
  },
}

function DefaultBadgeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", className)}
      aria-hidden="true"
    >
      <path
        d="M12 3l9 6v6l-9 6-9-6V9l9-6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="11" r="1.25" fill="currentColor" />
      <rect
        x="11.25"
        y="13.5"
        width="1.5"
        height="4"
        rx=".75"
        fill="currentColor"
      />
    </svg>
  )
}

export function ConfirmDialog({
  open: openProp,
  onOpenChange: onOpenChangeProp,
  trigger,
  variant = "danger",
  title,
  description,
  descriptionAsChild = false,
  confirmText = "Yes, Continue",
  cancelText = "Close",
  button,
  onConfirm,
  onCancel,
  lockDuringConfirm = true,
  contentClassName,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const controlled = typeof openProp === "boolean"
  const open = controlled ? (openProp as boolean) : internalOpen

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

  const isStringDesc = typeof description === "string"

  return (
    <AlertDialog open={open} onOpenChange={safeSetOpen}>
      {trigger ? (
        <div onClick={() => safeSetOpen(true)} role="presentation">
          {trigger}
        </div>
      ) : null}

      <AlertDialogContent
        className={cn(
          "rounded-2xl border shadow-lg sm:max-w-[520px] px-6 pb-6 pt-5",
          v.border,
          contentClassName
        )}
      >
        <AlertDialogHeader className="text-left space-y-2">
          <AlertDialogTitle
            className={cn("font-hnd text-[22px]/[30px] font-bold", v.title)}
          >
            {title}
          </AlertDialogTitle>

          {/* Description handling — avoid <div> inside <p> */}
          {description !== undefined ? (
            descriptionAsChild && !isStringDesc ? (
              <AlertDialogDescription asChild>
                {description as React.ReactElement}
              </AlertDialogDescription>
            ) : isStringDesc ? (
              <AlertDialogDescription className="text-[18px]/[28px] text-[#667085]">
                {description as string}
              </AlertDialogDescription>
            ) : null
          ) : null}
        </AlertDialogHeader>

        {!isStringDesc && description && !descriptionAsChild ? (
          <div className="mt-2">{description}</div>
        ) : null}

        <AlertDialogFooter className="mt-4 gap-3 sm:justify-between">
          <CancelButton
            onClick={handleCancel}
            disabled={busy}
            text={cancelText}
          />

          {button ? (
            button
          ) : (
            <AlertDialogAction
              className={cn(
                "h-[43.33px] rounded-[8.53px] text-base leading-[120%] tracking-normal font-hnd font-bold  px-6 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px] cursor-pointer",
                v.confirm
              )}
              onClick={handleConfirm}
              disabled={busy}
            >
              {busy ? "Please wait…" : confirmText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
