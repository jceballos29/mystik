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
    // "YYYY-MM-DD" strings are parsed as UTC midnight by the Date constructor,
    // which displays the previous day for users in UTC- timezones. Appending
    // T12:00:00 forces local-time interpretation at noon, preventing off-by-one.
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

/**
 * Encodes a value as a URL-safe base64 string (no padding).
 * JSON → encodeURIComponent → raw bytes → btoa → URL-safe chars.
 */
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

/**
 * Decodes a URL-safe base64 string produced by `encodeBase64Url`.
 * Throws if the string is not valid base64 or not valid JSON.
 */
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
