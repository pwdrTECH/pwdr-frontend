"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { Button, type ButtonProps } from "./button"

// Tiny cn fallback; replace with your own if you have one.
function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ")
}

type SubmitButtonProps = Omit<ButtonProps, "type"> & {
  /** Override loading state manually (else auto from react-hook-form) */
  loading?: boolean
  /** Text shown while submitting; defaults to children */
  loadingText?: React.ReactNode
  /** Optional left icon when idle */
  leftIcon?: React.ReactNode
  /** Optional left icon while loading (spinner shown by default if omitted) */
  loadingIcon?: React.ReactNode
  /** Make button full width (w-full) */
  fullWidth?: boolean
}

export const SubmitButton = React.forwardRef<
  HTMLButtonElement,
  SubmitButtonProps
>(
  (
    {
      className,
      loading,
      loadingText,
      children,
      leftIcon,
      loadingIcon,
      fullWidth,
      disabled,
      ...props
    },
    ref
  ) => {
    // If inside <Form {...form}> from shadcn (FormProvider), this will work automatically
    const form = useFormContext()
    const isSubmitting = form?.formState?.isSubmitting ?? false
    const busy = loading ?? isSubmitting

    return (
      <Button
        ref={ref}
        type="submit"
        aria-busy={busy || undefined}
        data-busy={busy ? "" : undefined}
        disabled={disabled || busy}
        className={cn(fullWidth && "w-full", "relative", className)}
        {...props}
      >
        {/* Left adornment (idle) */}
        {!busy && leftIcon ? (
          <span className="mr-2 inline-flex items-center">{leftIcon}</span>
        ) : null}

        {/* Loading adornment */}
        {busy ? (
          <span className="mr-2 inline-flex items-center">
            {loadingIcon ?? (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Loading"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
          </span>
        ) : null}

        {/* Label */}
        <span className="inline-flex items-center">
          {busy ? loadingText ?? children : children}
        </span>

        {/* Optional subtle progress bar (CSS only) */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-white/50",
            "data-[busy]:scale-x-100 data-[busy]:animate-[progress_1.2s_ease-in-out_infinite]",
            "rounded-b",
            busy && "scale-x-100"
          )}
        />
        <style jsx>{`
          @keyframes progress {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(-20%);
            }
            100% {
              transform: translateX(0%);
            }
          }
        `}</style>
      </Button>
    )
  }
)
SubmitButton.displayName = "SubmitButton"
