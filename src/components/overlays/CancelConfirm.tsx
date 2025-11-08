"use client"
import * as React from "react"
import { ConfirmPopover, type ConfirmPopoverProps } from "./ConfirmPopover"

export function CancelConfirm(
  props: Omit<ConfirmPopoverProps, "variant" | "title"> & {
    title?: React.ReactNode
  }
) {
  return (
    <ConfirmPopover
      variant="danger"
      title={props.title ?? "Cancel Form?"}
      confirmText="Yes, Cancel"
      {...props}
    />
  )
}
