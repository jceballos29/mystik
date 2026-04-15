"use server"

import { astroFetch } from "@/lib/astro-api/client"
import {
  geoSearchResponseSchema,
  type GeoSearchResponse,
} from "@/lib/validations/geo.schema"

interface GeoSuccess {
  data: GeoSearchResponse
  error?: never
}

interface GeoError {
  data?: never
  error: string
}

export type GeoResult = GeoSuccess | GeoError

const GEO_SEARCH_TIMEOUT_MS = 30_000

export async function searchCities(query: string): Promise<GeoResult> {
  const trimmed = query.trim()

  if (trimmed.length < 2) {
    return { data: { results: [], count: 0 } }
  }

  try {
    const params = new URLSearchParams({
      q: trimmed,
      limit: "10",
    })

    const raw = await astroFetch<unknown>(`/api/v1/geo/search?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(GEO_SEARCH_TIMEOUT_MS),
    })

    const parsed = geoSearchResponseSchema.safeParse(raw)

    if (!parsed.success) {
      console.error(
        "[searchCities] Schema validation failed:",
        parsed.error.issues
      )
      return { error: "The geocoding response format has changed." }
    }

    return { data: parsed.data }
  } catch (error) {
    console.error("[searchCities] Fetch error:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "We couldn't search for cities. Please try again.",
    }
  }
}
