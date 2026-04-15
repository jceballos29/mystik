"use server"

import { cacheLife } from "next/cache"

import { astroFetch } from "@/lib/astro-api/client"
import {
  horoscopeApiResponseSchema,
  type HoroscopeData,
  type HoroscopeMeta,
} from "@/lib/validations/horoscope.schema"
import { isValidSign } from "@/lib/zodiac-signs"

interface HoroscopeSuccess {
  data: HoroscopeData
  meta: HoroscopeMeta
  error?: never
}

interface HoroscopeError {
  data?: never
  meta?: never
  error: string
}

export type HoroscopeResult = HoroscopeSuccess | HoroscopeError

export async function getDailyHoroscope(
  sign: string,
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

    return { data: parsed.data.data, meta: parsed.data.meta }
  } catch (error) {
    console.error("[getDailyHoroscope] Fetch error:", error)
    return { error: "We couldn't load the reading. Please try again." }
  }
}

const MIN_BIRTH_YEAR = 1900

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

export async function getPersonalizedHoroscope(
  birth: BirthInput
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

    return { data: parsed.data.data, meta: parsed.data.meta }
  } catch (error) {
    console.error("[getPersonalizedHoroscope] Fetch error:", error)
    return {
      error: "We couldn't load your personalized reading. Please try again.",
    }
  }
}
