"use client";
import type { ReactNode } from "react";
import { ConfirmDialog, type ConfirmDialogProps } from "./ConfirmDialog";

export function DeleteConfirm(
  props: Omit<ConfirmDialogProps, "variant" | "title"> & {
    title?: ReactNode;
  },
) {
  return (
    <ConfirmDialog
      variant="danger"
      title={props.title ?? "Delete item?"}
      confirmText="Yes, Delete"
      {...props}
    />
  );
}
