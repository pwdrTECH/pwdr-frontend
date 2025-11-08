"use client"

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
import * as React from "react"
import { Control, FieldPath, FieldValues } from "react-hook-form"
import Label from "./label"

type BaseProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: React.ReactNode
  description?: React.ReactNode
  className?: string
  inputClassName?: string
} & Omit<
  ComponentProps<"input">,
  "name" | "defaultValue" | "onChange" | "value"
>

export function PasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  label = "Password",
  description,
  className,
  inputClassName,
  ...inputProps
}: BaseProps<TFieldValues>) {
  // const [show, setShow] = React.useState(false)
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
              <Input
                {...field}
                {...inputProps}
                type="password"
                // type={show ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className={inputClassName}
              />
              {/* <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {show ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button> */}
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
