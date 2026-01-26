"use client"

import { Label as UILabel } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ComponentProps, ReactNode } from "react"

type Props = ComponentProps<typeof UILabel> & {
  title?: ReactNode
}

export default function Label({
  htmlFor,
  title,
  className,
  children,
  ...rest
}: Props) {
  return (
    <UILabel
      htmlFor={htmlFor}
      className={cn(
        "text-[14.93px] leading-[21.33px] tracking-normal font-medium font-hnd text-[#344054]",
        className,
      )}
      {...rest}
    >
      {title ?? children}
    </UILabel>
  )
}
