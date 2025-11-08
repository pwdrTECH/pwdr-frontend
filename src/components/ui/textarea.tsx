import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-inputplaceholder:text-[#66666699] selection:bg-primary selection:text-[#667085] border-[#D0D5DD] w-full min-w-0 rounded-[8.97px] border bg-transparent px-[15.7px] py-[11.22px] text-[17.95px] leading-[26.92px] font-hnd font-normal tracking-normal   focus-visible:border-primary focus-visible:ring-primary/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-[109px] text-sm shadow-[0px_1.12px_2.24px_0px_#1018280D] transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 appearance-none resize-none",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
