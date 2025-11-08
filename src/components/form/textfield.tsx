"use client"

import * as React from "react"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import Label from "./label"

type BaseProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: React.ReactNode
  description?: React.ReactNode
  className?: string
  inputClassName?: string
  /** Optional icon/content to show inside the input on the left */
  leftAdornment?: React.ReactNode
  /** Optional icon/content to show inside the input on the right */
  rightAdornment?: React.ReactNode
  /** Extra class for adornment wrappers (applies to both left/right) */
  adornmentClassName?: string
} & Omit<
  ComponentProps<"input">,
  "name" | "defaultValue" | "onChange" | "value"
>

export function TextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  inputClassName,
  leftAdornment,
  rightAdornment,
  adornmentClassName,
  ...inputProps
}: BaseProps<TFieldValues>) {
  const hasLeft = !!leftAdornment
  const hasRight = !!rightAdornment
  const inputId = inputProps.id ?? String(name)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col gap-[6.4px]", className)}>
          {label && <Label htmlFor={inputId}>{label}</Label>}
          <FormControl>
            <div className="relative">
              {hasLeft && (
                <div
                  className={cn(
                    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2",
                    adornmentClassName
                  )}
                >
                  {leftAdornment}
                </div>
              )}

              <Input
                {...field}
                {...inputProps}
                className={cn(
                  hasLeft && "pl-9",
                  hasRight && "pr-9",
                  inputClassName
                )}
              />

              {hasRight && (
                <div
                  className={cn(
                    "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2",
                    adornmentClassName
                  )}
                >
                  {rightAdornment}
                </div>
              )}
            </div>
          </FormControl>

          {description && (
            <FormDescription className="text-[12px] text-[#8c90a3]">
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
