"use client";
import type { ReactNode } from "react";
import { ConfirmPopover, type ConfirmPopoverProps } from "./ConfirmPopover";

export function CancelConfirm(
  props: Omit<ConfirmPopoverProps, "variant" | "title"> & {
    title?: ReactNode;
  },
) {
  return (
    <ConfirmPopover
      variant="danger"
      title={props.title ?? "Cancel Form?"}
      confirmText="Yes, Cancel"
      {...props}
    />
  );
}
