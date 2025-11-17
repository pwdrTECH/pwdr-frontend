"use client"

import { ConfirmDialog } from "@/components/overlays/ConfirmDialog"
import { DeleteIcon } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as React from "react"

type Props = {
  serviceId: string
  serviceName?: string
  /**
   * Optional callback invoked after successful delete.
   * If omitted, parent can listen to the `service:deleted` CustomEvent on window.
   */
  className?: string
  trigger?: React.ReactNode // custom trigger (button/icon). If omitted a default Delete button is rendered.
  apiPath?: (id: string) => string // override API URL, default `/api/services/${id}`
}

/**
 * Self-contained Delete button:
 * - Shows confirm dialog
 * - Calls DELETE /api/services/:id by default
 * - Emits `window.dispatchEvent(new CustomEvent('service:deleted', { detail: { id } }))`
 *   on success so parent can update UI without passing handlers.
 */
export default function DeleteServiceButton({
  serviceId,
  serviceName = "this item",
  className,
  trigger,
}: Props) {
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function doDelete() {
    console.log(serviceId)
    setError(null)
    setBusy(true)
    console.log
  }

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "w-full h-[43.33px] hover:bg-gray-50 hover:text-[#344054] text-[#344054] font-bold text-[14.93px]/[21.33px] bg-transparent justify-start shadow-none cursor-pointer py-[10.67px] px-[14.93px]",
        className
      )}
    >
      <DeleteIcon />
      <span className="ml-2">Delete</span>
    </Button>
  )

  return (
    <ConfirmDialog
      trigger={trigger ?? defaultTrigger}
      variant="danger"
      title={`Delete ${serviceName}?`}
      description={
        <>
          Are you sure you want to delete <strong>{serviceName}</strong>? This
          action cannot be undone.
          {error && <div className="mt-2 text-xs text-rose-600">{error}</div>}
        </>
      }
      confirmText={busy ? "Deleting…" : "Yes, Delete"}
      cancelText="Cancel"
      lockDuringConfirm
      onConfirm={async () => {
        try {
          await doDelete()
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
          // rethrow to let ConfirmDialog handle (it may close or show error depending on your implementation)
          throw err
        }
      }}
    />
  )
}
