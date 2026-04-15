// "use server" marks this entire module as Next.js Server Actions.
// Exported functions can be called from Client Components as if they
// were local functions, but Next.js executes them on the server.
// Why here: geocoding calls astroFetch, which requires the API_KEY
// and is marked "server-only" — this module cannot run on the client.
"use server"

import { astroFetch } from "@/lib/astro-api/client"
import {
  geoSearchResponseSchema,
  type GeoSearchResponse,
} from "@/lib/validations/geo.schema"

// Discriminated types for the action result.
// Why this pattern instead of throwing exceptions:
// Next.js Server Actions serialize their return value to send it to the client.
// A `throw` inside a Server Action cannot be caught with try/catch
// on the client — Next.js converts it into a generic network error.
// With this pattern, the caller always receives an object with a known shape
// and can safely check `if (result.error)`.
// The `never` property in each branch guarantees exclusivity in TypeScript:
// if `data` is present, `error` cannot exist, and vice versa.
interface GeoSuccess {
  data: GeoSearchResponse
  error?: never
}

interface GeoError {
  data?: never
  error: string
}

/** Result of `searchCities`: success with data or failure with an error message. */
export type GeoResult = GeoSuccess | GeoError

/**
 * Searches for cities by name to use as input for other endpoints
 * (personal horoscope, birth chart) that require geographic coordinates.
 *
 * Why this intermediary exists instead of calling the geo API directly
 * from the component:
 * - The API key cannot live on the client.
 * - This Server Action validates the response against a Zod schema before
 *   returning it, ensuring the client always receives the expected shape.
 *
 * Cache strategy: `cache: "no-store"`.
 * Searches are interactive (the user types in real time) and
 * depend on the exact query — caching them would be pointless and could
 * return stale results.
 *
 * @param query  Free text with the city name (e.g. "Buenos Aires")
 * @returns      List of matching cities, or an error message
 */
const GEO_SEARCH_TIMEOUT_MS = 30_000

export async function searchCities(query: string): Promise<GeoResult> {
  const trimmed = query.trim()

  // Short-circuit for queries that are too short: avoids API calls
  // that would inevitably return irrelevant results or errors.
  // Returns an empty list (not an error) so the UI can show
  // "type more characters" without treating this as a failure.
  if (trimmed.length < 2) {
    return { data: { results: [], count: 0 } }
  }

  try {
    const params = new URLSearchParams({
      q: trimmed,
      limit: "10",
    })

    // `cache: "no-store"` ensures Next.js never serves this response
    // from its Data Cache — every search always hits the geo server.
    // 30s signal: the Render free tier has cold starts that can exceed
    // the default 15s; geo search is interactive so we allow more time.
    const raw = await astroFetch<unknown>(`/api/v1/geo/search?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(GEO_SEARCH_TIMEOUT_MS),
    })

    // We validate the response against the schema before passing it to the client.
    // If FreeAstroAPI changes its contract (new field, different type),
    // the error is caught here with a clear message instead of propagating
    // as a crash at render time.
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
    // astroFetch throws ApiProxyError on timeouts, network errors, and
    // 4xx/5xx responses. We catch them here to fulfill the return contract
    // (never throw to the caller) and to log the original error with context.
    console.error("[searchCities] Fetch error:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "We couldn't search for cities. Please try again.",
    }
  }
}
