import React from "react"
import { Button } from "@/components/ui/button"

interface CancelButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  text?: string
  disabled?: boolean
}
export function CancelButton({ disabled, onClick, text }: CancelButtonProps) {
  return (
    <Button
      type="button"
      variant="destructive"
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </Button>
  )
}
