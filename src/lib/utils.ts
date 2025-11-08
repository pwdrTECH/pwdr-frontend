import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatNaira(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v
  if (Number.isNaN(n)) return "₦ 0"
  return `₦ ${n.toLocaleString("en-NG")}`
}
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
