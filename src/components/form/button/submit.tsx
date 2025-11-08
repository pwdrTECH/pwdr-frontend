import { Button } from "@/components/ui/button"
import React from "react"

interface SubmitButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children?: React.ReactNode
  disabled?: boolean
  formId?: string
}

export function SubmitButton({
  disabled,
  children,
  formId,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      form={formId}
      className="h-[43.33px] rounded-[8.53px]"
      disabled={disabled}
    >
      {children}
    </Button>
  )
}
