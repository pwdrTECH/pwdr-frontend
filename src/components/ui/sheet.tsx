"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Root bits
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(
  props: React.ComponentProps<typeof SheetPrimitive.Trigger>
) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      {...props}
      className={cn(
        "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100",
        "focus:outline-none focus:ring-2 focus:ring-ring ring-offset-background focus:ring-offset-2",
        "disabled:pointer-events-none"
      )}
    />
  )
}

function SheetPortal(
  props: React.ComponentProps<typeof SheetPrimitive.Portal>
) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "fixed inset-0 z-50",
        "bg-[#FFFFFF1A] backdrop-blur-[8px]",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  showClose = false,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showClose?: boolean
}) {
  return (
    <SheetPortal>
      {/* keep overlay inside the portal so it sits behind the panel */}
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out",
          "fixed z-50 flex flex-col gap-4 shadow-none transition ease-in-out",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l-[1.07px] sm:max-w-[100vw] border-[#EAECF0]",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-[100vw]",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <SheetPrimitive.Close
            className={cn(
              "absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100",
              "focus:outline-none focus:ring-2 focus:ring-ring ring-offset-background focus:ring-offset-2",
              "disabled:pointer-events-none"
            )}
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 pt-[25.6px]", className)}
      {...rest}
    />
  )
}

function SheetFooter(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...rest}
    />
  )
}

function SheetTitle(props: React.ComponentProps<typeof SheetPrimitive.Title>) {
  const { className, ...rest } = props
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "text-[24px]/[32px] text-[#101828] font-bold font-hnd tracking-normal",
        className
      )}
      {...rest}
    />
  )
}

function SheetDescription(
  props: React.ComponentProps<typeof SheetPrimitive.Description>
) {
  const { className, ...rest } = props
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn(
        "font-normal font-hnd text-[16px]/[21.33px] text-[#475467] tracking-normal ",
        className
      )}
      {...rest}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
