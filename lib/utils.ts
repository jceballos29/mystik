import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function svgCircumference(radius: number): number {
  return 2 * Math.PI * radius
}

export function formatLocalDate(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      ? dateStr + "T12:00:00"
      : dateStr
    return new Date(normalized).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    })
  } catch {
    return dateStr
  }
}

export function encodeBase64Url(obj: unknown): string {
  const json = JSON.stringify(obj)
  const utf8Bytes = encodeURIComponent(json).replace(
    /%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode(parseInt(p1, 16))
  )
  return btoa(utf8Bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

export function decodeBase64Url(encoded: string): unknown {
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/")
  const decoded = atob(padded)
  const json = decodeURIComponent(
    decoded
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  )
  return JSON.parse(json)
}
