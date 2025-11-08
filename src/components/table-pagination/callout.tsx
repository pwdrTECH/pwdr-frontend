"use client"

import * as React from "react"
import { EllipsisVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Variant = "default" | "link" | "danger" | "muted"

/** A fully custom button node rendered inside the menu (keeps all your handlers/contexts) */
export type RowMenuButtonItem = {
  type: "button"
  /** The actual clickable element (e.g., <DialogTrigger asChild><button/></DialogTrigger>) */
  button: React.ReactNode
  /** Prevent the menu from closing when this item is clicked */
  keepOpen?: boolean
  disabled?: boolean
}

/** A simple action (renders a standard DropdownMenuItem with an onSelect) */
export type RowMenuActionItem = {
  type: "action"
  label: React.ReactNode
  onSelect: () => void
  icon?: React.ReactNode
  variant?: Variant
  disabled?: boolean
}

export type RowMenuProps = {
  items: (RowMenuButtonItem | RowMenuActionItem | "separator")[]
  align?: "start" | "end" | "center"
  triggerIcon?: React.ReactNode
  triggerClassName?: string
}

export function RowMenu({
  items,
  align = "end",
  triggerIcon = <EllipsisVertical className="h-5 w-5" />,
  triggerClassName = "h-8 w-8 hover:bg-gray-50 text-[#6B7280] hover:text-[#1A1D29]",
}: RowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={triggerClassName}>
          {triggerIcon}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="w-fit">
        {items.map((item, idx) => {
          if (item === "separator")
            return (
              <DropdownMenuSeparator
                key={`sep-${idx}`}
                className="bg-[#D0D5DD] "
              />
            )

          if (item.type === "button") {
            return (
              <DropdownMenuItem
                key={`btn-${idx}`}
                asChild
                disabled={item.disabled}
                // keep the menu open if requested
                onSelect={item.keepOpen ? (e) => e.preventDefault() : undefined}
                className="w-fit cursor-pointer"
              >
                {/* Your custom node becomes the clickable child */}
                {item.button}
              </DropdownMenuItem>
            )
          }

          // action item
          const base =
            item.variant === "danger"
              ? "text-red-600 focus:text-red-700"
              : item.variant === "link"
              ? "text-primary font-semibold hover:underline"
              : item.variant === "muted"
              ? "text-muted-foreground"
              : ""

          return (
            <DropdownMenuItem
              key={`act-${idx}`}
              onClick={item.onSelect}
              disabled={item.disabled}
              className={`w-fit cursor-pointer ${base}`}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span>{item.label}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
