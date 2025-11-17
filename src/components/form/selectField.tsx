"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import Label from "./label";
import type { ReactNode } from "react";

export type SelectOption = {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
};

type BaseProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;

  label?: ReactNode;
  hideLabel?: boolean;
  description?: ReactNode;

  placeholder?: string;
  options: ReadonlyArray<SelectOption>;

  className?: string;
  triggerClassName?: string;
  contentClassName?: string;

  disabled?: boolean;
  id?: string;
  triggerAriaLabel?: string;

  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  adornmentClassName?: string;

  onValueChange?: (value: string) => void;
};

export function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  hideLabel,
  description,
  placeholder = "Select…",
  options,
  className,
  triggerClassName,
  contentClassName,
  disabled,
  id,
  triggerAriaLabel,
  leftAdornment,
  rightAdornment,
  startAdornment,
  endAdornment,
  adornmentClassName,
  onValueChange,
}: BaseProps<TFieldValues>) {
  const left = leftAdornment ?? startAdornment;
  const right = rightAdornment ?? endAdornment;
  const hasLeft = !!left;
  const hasRight = !!right;
  const inputId = id ?? String(name);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const triggerId = id ?? String(name);

        return (
          <FormItem className={cn("flex flex-col gap-2", className)}>
            {!hideLabel && label && <Label htmlFor={inputId}>{label}</Label>}
            {hideLabel && label && (
              <span id={`${triggerId}-visually-hidden`} className="sr-only">
                {typeof label === "string" ? label : "Select"}
              </span>
            )}

            <FormControl>
              <Select
                disabled={disabled}
                value={field.value ?? undefined}
                onValueChange={(v) => {
                  field.onChange(v);
                  onValueChange?.(v);
                }}
              >
                <SelectTrigger
                  id={triggerId}
                  aria-invalid={hasError || undefined}
                  aria-label={
                    hideLabel
                      ? (triggerAriaLabel ??
                        (typeof label === "string" ? label : "Select"))
                      : undefined
                  }
                  className={cn(
                    "relative w-full max-w-full",
                    hasLeft && "pl-9",
                    hasRight ? "pr-12" : "pr-9",
                    "[&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2",
                    hasError &&
                      "border-destructive focus-visible:ring-destructive",
                    triggerClassName,
                  )}
                >
                  {hasLeft && (
                    <span
                      className={cn(
                        "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
                        adornmentClassName,
                      )}
                    >
                      {left}
                    </span>
                  )}

                  <SelectValue placeholder={placeholder} />

                  {hasRight && (
                    <span
                      className={cn(
                        "pointer-events-none absolute right-8 top-1/2 -translate-y-1/2",
                        adornmentClassName,
                      )}
                    >
                      {right}
                    </span>
                  )}
                </SelectTrigger>

                <SelectContent
                  position="popper"
                  align="start"
                  sideOffset={6}
                  className={cn(
                    "z-[240] max-h-72 overflow-y-auto text-[14px]",
                    contentClassName,
                  )}
                >
                  <SelectGroup>
                    {options.map((opt) => (
                      <SelectItem
                        key={String(opt.value)}
                        value={String(opt.value)}
                        disabled={opt.disabled}
                        className="text-[14px]"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>

            {description && !hasError && (
              <FormDescription className="text-[12px] text-[#8c90a3]">
                {description}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
