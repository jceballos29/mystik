/**
 * @module astro-api/horoscope
 *
 * Server Actions para obtener horóscopos diarios (por signo y personalizados).
 * Cada función valida su entrada, invoca la API externa a través de `astroFetch`,
 * y valida la respuesta contra esquemas Zod antes de retornar datos tipados.
 */
"use server"

import { cacheLife } from "next/cache"

import { astroFetch } from "@/lib/astro-api/client"
import {
  horoscopeApiResponseSchema,
  type HoroscopeData,
  type HoroscopeMeta,
} from "@/lib/validations/horoscope.schema"
import { isValidSign } from "@/lib/zodiac-signs"
import { translateHoroscopeData } from "@/lib/translate/horoscope"

// --- Tipos e Interfaces ---

/** Resultado exitoso de una petición de horóscopo. */
interface HoroscopeSuccess {
  data: HoroscopeData
  meta: HoroscopeMeta
  error?: never
}

/** Resultado fallido de una petición de horóscopo. */
interface HoroscopeError {
  data?: never
  meta?: never
  error: string
}

/**
 * Unión discriminada que representa el resultado de cualquier operación
 * de horóscopo. Permite pattern matching seguro en el cliente:
 * `if (result.error) { ... } else { result.data }`
 */
export type HoroscopeResult = HoroscopeSuccess | HoroscopeError

// --- Acciones de Servidor ---

/**
 * Obtiene el horóscopo diario para un signo zodiacal específico.
 *
 * La respuesta se cachea por 1 hora usando ISR con tags dinámicos
 * basados en el signo y la fecha, permitiendo revalidación selectiva.
 *
 * @param sign - Slug del signo zodiacal (ej. "aries", "leo").
 * @param date - Fecha en formato `YYYY-MM-DD` o `"today"` (por defecto).
 * @returns Datos del horóscopo con metadata, o un error descriptivo.
 */
export async function getDailyHoroscope(
  sign: string,
  locale: string = "en",
  date: string = "today"
): Promise<HoroscopeResult> {
  const slug = sign.toLowerCase()

  if (!isValidSign(slug)) {
    return { error: `Invalid sign: "${sign}"` }
  }

  if (date !== "today") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
      return {
        error: `Invalid date format: "${date}". Use YYYY-MM-DD or "today".`,
      }
    }
  }

  try {
    const params = new URLSearchParams({ sign: slug, date })

    const raw = await astroFetch<unknown>(
      `/api/v2/horoscope/daily/sign?${params}`,
      { next: { revalidate: 3600, tags: [`horoscope-${slug}-${date}`] } }
    )

    const parsed = horoscopeApiResponseSchema.safeParse(raw)

    if (!parsed.success) {
      console.error(
        "[getDailyHoroscope] Schema validation failed:",
        parsed.error.issues
      )
      return { error: "The API schema has changed." }
    }

    if (locale !== "en") {
      try {
        const translated = await translateHoroscopeData(
          parsed.data.data,
          locale
        )
        return { data: translated, meta: parsed.data.meta }
      } catch (err) {
        console.error("[getDailyHoroscope] Translation failed:", err)
      }
    }

    return { data: parsed.data.data, meta: parsed.data.meta }
  } catch (error) {
    console.error("[getDailyHoroscope] Fetch error:", error)
    return { error: "We couldn't load the reading. Please try again." }
  }
}

// --- Horóscopo Personalizado ---

/**
 * Año mínimo aceptado para la fecha de nacimiento.
 * Previene datos astrológicos fuera de las efemérides confiables.
 */
const MIN_BIRTH_YEAR = 1900

/**
 * Datos de nacimiento requeridos para generar una lectura personalizada.
 * Se transmiten desde el formulario del cliente codificados en Base64URL.
 */
export interface BirthInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  latitude: number
  longitude: number
  city: string
}

/**
 * Invocación cacheada a la API de horóscopo personalizado.
 * Se separó en una función interna para que `"use cache"` opere
 * a nivel de esta función específica, sin afectar la validación
 * previa que no debe cachearse.
 *
 * @param payload - Datos de nacimiento y fecha objetivo.
 * @returns Respuesta cruda de la API (sin validar).
 */
async function fetchPersonalizedHoroscope(payload: {
  birth: {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    latitude: number
    longitude: number
    city?: string
  }
  date: string
}) {
  "use cache"
  cacheLife("hours")
  return astroFetch<unknown>(`/api/v2/horoscope/daily/personal`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/**
 * Genera un horóscopo diario personalizado basado en la carta natal del usuario.
 *
 * Realiza validaciones de rango en cada campo de nacimiento antes de
 * invocar la API. La respuesta se cachea a nivel de función para evitar
 * cálculos repetidos con los mismos datos de nacimiento.
 *
 * @param birth - Datos completos de nacimiento incluyendo coordenadas geográficas.
 * @returns Datos personalizados del horóscopo con tránsitos, o un error descriptivo.
 */
export async function getPersonalizedHoroscope(
  birth: BirthInput,
  locale: string = "en"
): Promise<HoroscopeResult> {
  if (birth.latitude == null || birth.longitude == null) {
    return { error: "Birth location is required for a personalized reading." }
  }

  if (birth.year < MIN_BIRTH_YEAR || birth.year > new Date().getFullYear()) {
    return { error: `Invalid birth year: ${birth.year}` }
  }

  if (birth.month < 1 || birth.month > 12) {
    return { error: `Invalid birth month: ${birth.month}` }
  }

  if (birth.day < 1 || birth.day > 31) {
    return { error: `Invalid birth day: ${birth.day}` }
  }

  if (birth.hour < 0 || birth.hour > 23) {
    return { error: `Invalid birth hour: ${birth.hour}` }
  }

  if (birth.minute < 0 || birth.minute > 59) {
    return { error: `Invalid birth minute: ${birth.minute}` }
  }

  try {
    const today = new Date().toISOString().split("T")[0]

    const payload = {
      birth: {
        year: birth.year,
        month: birth.month,
        day: birth.day,
        hour: birth.hour,
        minute: birth.minute,
        latitude: birth.latitude,
        longitude: birth.longitude,
        city: birth.city,
      },
      date: today,
    }

    const raw = await fetchPersonalizedHoroscope(payload)

    const parsed = horoscopeApiResponseSchema.safeParse(raw)

    if (!parsed.success) {
      console.error(
        "[getPersonalizedHoroscope] Schema validation failed:",
        parsed.error.issues
      )
      return { error: "The API schema has changed." }
    }

    if (locale !== "en") {
      try {
        const translated = await translateHoroscopeData(
          parsed.data.data,
          locale
        )
        return { data: translated, meta: parsed.data.meta }
      } catch (err) {
        console.error("[getPersonalizedHoroscope] Translation failed:", err)
      }
    }

    return { data: parsed.data.data, meta: parsed.data.meta }
  } catch (error) {
    console.error("[getPersonalizedHoroscope] Fetch error:", error)
    return {
      error: "We couldn't load your personalized reading. Please try again.",
    }
  }
}
