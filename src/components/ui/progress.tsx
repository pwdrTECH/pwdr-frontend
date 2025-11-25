"use client";

import { cn } from "@/lib/utils";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import type { ComponentProps } from "react";

type ProgressVariant = "linear" | "circular";

interface ProgressProps extends ComponentProps<typeof ProgressPrimitive.Root> {
  variant?: ProgressVariant;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  value?: number | null;
}
export function Progress({
  className,
  value = 0,
  variant = "linear",
  size = 100,
  strokeWidth = 8,
  showLabel = true,
  ...props
}: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value ?? 0));
  if (variant === "circular") {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safeValue / 100) * circumference;
    const paddedLabel = `${String(safeValue).padStart(2, "0")}%`;

    return (
      <div
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size}>
          <title>Progress: {safeValue}%</title>

          {/* Background circle */}
          <circle
            stroke="transparent"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Progress circle – rotated so it starts at 12 o'clock */}
          <circle
            stroke="#FFFFFFEB"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-300"
          />
        </svg>

        {showLabel && (
          <span className="absolute font-hnd font-medium text-[10px] tracking-normal text-white">
            {paddedLabel}
          </span>
        )}
      </div>
    );
  }

  // Default: linear (your original implementation)
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      value={safeValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
