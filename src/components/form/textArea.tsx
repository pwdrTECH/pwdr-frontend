"use client"

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type * as React from "react"
import type { ComponentProps } from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

type TextareaFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: React.ReactNode
  description?: React.ReactNode
  className?: string
  textareaClassName?: string
  rows?: number
} & Omit<
  ComponentProps<"textarea">,
  "name" | "defaultValue" | "onChange" | "value"
>

export function TextareaField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  textareaClassName,
  rows = 3,
  ...textareaProps
}: TextareaFieldProps<TFieldValues>) {
  const inputId = textareaProps.id ?? String(name)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col gap-[6.4px]", className)}>
          {label && <Label htmlFor={inputId}>{label}</Label>}

          <FormControl>
            <Textarea
              {...field}
              {...textareaProps}
              rows={rows}
              className={textareaClassName}
            />
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
