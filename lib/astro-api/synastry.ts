"use server"

import { cacheLife } from "next/cache"

import { astroFetch } from "@/lib/astro-api/client"
import {
  synastryApiPayloadSchema,
  synastryApiResponseSchema,
  type SynastryApiPayload,
  type SynastryApiResponse,
} from "@/lib/validations/synastry.schema"

interface SynastrySuccess {
  data: SynastryApiResponse
  error?: never
}

interface SynastryError {
  data?: never
  error: string
}

export type SynastryResult = SynastrySuccess | SynastryError

// Cached fetcher — same pair of people = same result.
// "use cache" is used instead of fetch-level caching because Next.js does not
// cache POST requests in its Data Cache. The cache key is automatically derived
// from the serialized payload, so different pairs produce different cache entries.
async function fetchSynastryFromAPI(payload: SynastryApiPayload) {
  "use cache"
  cacheLife("hours")
  return astroFetch<unknown>("/api/v1/western/synastrycards", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function calculateSynastry(
  payload: SynastryApiPayload
): Promise<SynastryResult> {
  const validation = synastryApiPayloadSchema.safeParse(payload)

  if (!validation.success) {
    return {
      error: "Invalid synastry payload: " + validation.error.issues[0]?.message,
    }
  }

  try {
    const raw = await fetchSynastryFromAPI(validation.data)

    const parsed = synastryApiResponseSchema.safeParse(raw)

    if (!parsed.success) {
      console.error(
        "[calculateSynastry] Schema validation failed:",
        parsed.error.issues
      )
      return { error: "The API schema has changed." }
    }

    return { data: parsed.data }
  } catch (error) {
    console.error("[calculateSynastry] Fetch error:", error)
    return { error: "We couldn't calculate the synastry. Please try again." }
  }
}
