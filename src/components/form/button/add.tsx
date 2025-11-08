import React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  text?: string
}

export function AddButon({ text = "Add", onClick }: AddButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="h-10 w-fit rounded-[8px] px-[14px] py-[10px] text-white"
    >
      <Plus className="h-6 w-6" />
      {text}
    </Button>
  )
}
