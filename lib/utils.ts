/**
 * @module utils
 *
 * Funciones utilitarias de propósito general compartidas en toda la aplicación.
 * Incluye merging de clases CSS, cálculos SVG, formateo de fechas
 * y codificación/decodificación Base64URL.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// --- Clases CSS ---

/**
 * Combina y fusiona clases de Tailwind CSS de forma segura.
 * Wrapper de `clsx` + `tailwind-merge` que resuelve conflictos
 * entre clases utilitarias (ej. `p-2` y `px-4` → `px-4 py-2`).
 *
 * @param inputs - Clases CSS, objetos condicionales o arrays de clases.
 * @returns String de clases CSS fusionadas sin conflictos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Cálculos SVG ---

/**
 * Calcula la circunferencia de un círculo SVG.
 * Se utiliza para animar barras de progreso circulares
 * mediante `stroke-dasharray` y `stroke-dashoffset`.
 *
 * @param radius - Radio del círculo en píxeles.
 * @returns Circunferencia del círculo (2πr).
 */
export function svgCircumference(radius: number): number {
  return 2 * Math.PI * radius
}

// --- Formateo de Fechas ---

/**
 * Formatea una cadena de fecha a formato legible localizado (en-US).
 *
 * Si la fecha solo contiene `YYYY-MM-DD`, agrega `T12:00:00` para evitar
 * que el parser de `Date` la interprete como UTC y desplace el día
 * en zonas horarias con offset negativo.
 *
 * @param dateStr - Fecha como string (formato `YYYY-MM-DD` o ISO completo).
 * @param options - Opciones de formato de `Intl.DateTimeFormat`.
 * @returns Fecha formateada (ej. "April 15, 2026") o el string original si falla.
 */
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

// --- Codificación Base64URL ---

/**
 * Codifica un objeto JavaScript a Base64URL seguro para query strings.
 *
 * Se utiliza para transmitir payloads complejos (datos de nacimiento,
 * sinastría) a través de parámetros de URL. La codificación reemplaza
 * caracteres conflictivos con la URL: `+` → `-`, `/` → `_`, sin padding `=`.
 *
 * @param obj - Objeto serializable a JSON.
 * @returns String codificado en Base64URL.
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
 * Decodifica un string Base64URL de vuelta a un objeto JavaScript.
 * Operación inversa de `encodeBase64Url()`.
 *
 * @param encoded - String codificado en Base64URL.
 * @returns Objeto JavaScript deserializado.
 * @throws {SyntaxError} Si el JSON contenido es inválido.
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
