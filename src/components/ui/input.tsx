import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[#667085] selection:bg-primary selection:text-[#667085] border-[#D0D5DD] h-[49.43px] w-full min-w-0 rounded-[8.97px] border bg-transparent px-[15.7px] py-[11.22px] shadow-[0px_1.12px_2.24px_0px_#1018280D] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-normal text-[17.07px] leading-[25.6px] font-hnd font-normal tracking-normal disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-primary",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
