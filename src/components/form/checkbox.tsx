"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import * as React from "react"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import Label from "./label"

/* =========================================================
 * Single boolean checkbox: name: boolean
 * =======================================================*/
type CheckboxFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: React.ReactNode
  description?: React.ReactNode
  className?: string
  checkboxClassName?: string
  disabled?: boolean
  id: string
}

export function CheckboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  checkboxClassName,
  disabled,
  id,
}: CheckboxFieldProps<TFieldValues>) {
  const inputId = id ?? String(name)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col gap-2", className)}>
          {label && <Label htmlFor={inputId}>{label}</Label>}

          <FormControl>
            <div className="min-h-6 flex items-center gap-[14px]">
              <Checkbox
                checked={!!field.value}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
                disabled={disabled}
                className={checkboxClassName}
              />
              {description && (
                <FormDescription className="text-[12px] text-[#6B7280]">
                  {description}
                </FormDescription>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

/* =========================================================
 * Checkbox group (array): name: string[]
 * options = [{ label, value, description?, disabled? }]
 * =======================================================*/
export type CheckboxOption = {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

type CheckboxGroupProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  options: ReadonlyArray<CheckboxOption>
  label?: React.ReactNode
  description?: React.ReactNode
  className?: string
  itemClassName?: string
  orientation?: "vertical" | "horizontal"
  gap?: string // tailwind gap (e.g., "gap-3")
}

export function CheckboxGroup<TFieldValues extends FieldValues>({
  control,
  name,
  options,
  className,
  itemClassName,
  orientation = "vertical",
  gap = "14px",
}: CheckboxGroupProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const current: string[] = Array.isArray(field.value)
          ? (field.value as string[])
          : []

        const toggle = (val: string) => {
          const set = new Set(current)
          set.has(val) ? set.delete(val) : set.add(val)
          field.onChange(Array.from(set))
        }

        const isChecked = (val: string) => current.includes(val)

        return (
          <FormItem className={cn("flex flex-col gap-[14px]", className)}>
            <div
              className={cn(
                "flex",
                orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
                gap
              )}
            >
              {options.map((opt) => {
                const id = `${String(name)}-${String(opt.value)}`
                return (
                  <div
                    key={String(opt.value)}
                    className={cn("flex items-start gap-3", itemClassName)}
                  >
                    <Checkbox
                      id={id}
                      checked={isChecked(opt.value)}
                      onCheckedChange={() => toggle(opt.value)}
                      disabled={opt.disabled}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <label
                        htmlFor={id}
                        className={cn(
                          "cursor-pointer select-none text-[14px] font-medium text-[#111827]",
                          opt.disabled && "opacity-60"
                        )}
                      >
                        {opt.label}
                      </label>
                      {opt.description && (
                        <p className="text-[12px] leading-5 text-[#6B7280]">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
