// "use server" marks this entire module as Next.js Server Actions.
// Exported functions can be called from Client Components as if they
// were local functions, but Next.js executes them on the server.
// Why here: getDailyHoroscope calls astroFetch, which requires the API_KEY
// and is marked "server-only" — this module cannot run on the client.
"use server"

import { cacheLife } from "next/cache"

import { astroFetch } from "@/lib/astro-api/client"
import {
  horoscopeApiResponseSchema,
  type HoroscopeData,
  type HoroscopeMeta,
} from "@/lib/validations/horoscope.schema"
import { isValidSign } from "@/lib/zodiac-signs"

// Discriminated types for the action result.
// Why this pattern instead of throwing exceptions:
// Next.js Server Actions serialize their return value to send it to the client.
// A `throw` inside a Server Action cannot be caught with try/catch
// on the client — Next.js converts it into a generic network error.
// With this pattern, the caller always receives an object with a known shape
// and can safely check `if (result.error)`.
// The `never` property in each branch guarantees exclusivity in TypeScript:
// if `data` is present, `error` cannot exist, and vice versa.
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

/** Result of `getDailyHoroscope`: success with data+meta or failure with an error message. */
export type HoroscopeResult = HoroscopeSuccess | HoroscopeError

/**
 * Fetches the daily horoscope for a given zodiac sign.
 *
 * Why this intermediary exists instead of calling the API directly
 * from the component:
 * - The API key cannot live on the client.
 * - This Server Action validates the sign and date before making the call,
 *   avoiding unnecessary requests to the external API.
 * - It validates the response against a Zod schema, ensuring the client
 *   always receives the expected shape regardless of API changes.
 *
 * Cache strategy: `next: { revalidate: 3600 }`.
 * The daily horoscope is the same for all users requesting the same
 * sign on the same date — it's a good candidate for caching. Next.js
 * will reuse the response for 1 hour before revalidating with FreeAstroAPI.
 *
 * @param sign  Zodiac sign slug in any capitalization (e.g. "Aries", "aries")
 * @param date  Date in "YYYY-MM-DD" format or the literal "today" (default value)
 * @returns     Horoscope data and metadata, or an error message
 */
export async function getDailyHoroscope(
  sign: string,
  date: string = "today"
): Promise<HoroscopeResult> {
  const slug = sign.toLowerCase()

  // Sign validation before calling the API.
  // isValidSign checks that the slug belongs to the 12 known signs.
  // Fails fast here instead of receiving a 404 or empty result from the API.
  if (!isValidSign(slug)) {
    return { error: `Invalid sign: "${sign}"` }
  }

  // Date format validation. "today" is the special value accepted by
  // the API; anything else must be an ISO date without time (YYYY-MM-DD).
  if (date !== "today") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
      return {
        error: `Invalid date format: "${date}". Use YYYY-MM-DD or "today".`,
      }
    }
  }

  try {
    const params = new URLSearchParams({ sign: slug, date })

    // `next: { revalidate: 3600 }` instructs the Next.js Data Cache to
    // reuse this response for 1 hour. Same sign+date combination
    // = same result, so caching is safe and reduces latency for
    // users requesting the same sign after the first request.
    const raw = await astroFetch<unknown>(
      `/api/v2/horoscope/daily/sign?${params}`,
      { next: { revalidate: 3600, tags: [`horoscope-${slug}-${date}`] } }
    )

    // We validate the response against the schema before passing it to the client.
    // If FreeAstroAPI changes its contract (new field, different type),
    // the error is caught here with a clear message instead of propagating
    // as a crash at render time.
    const parsed = horoscopeApiResponseSchema.safeParse(raw)

    if (!parsed.success) {
      console.error(
        "[getDailyHoroscope] Schema validation failed:",
        parsed.error.issues
      )
      return { error: "The API schema has changed." }
    }

    // The API returns `{ data: {...}, meta: {...} }` — we separate them so
    // the caller can access both independently without having to navigate
    // the nested structure.
    return { data: parsed.data.data, meta: parsed.data.meta }
  } catch (error) {
    // astroFetch throws ApiProxyError on timeouts, network errors, and
    // 4xx/5xx responses. We catch them here to fulfill the return contract
    // (never throw to the caller) and to log the original error with context.
    console.error("[getDailyHoroscope] Fetch error:", error)
    return { error: "We couldn't load the reading. Please try again." }
  }
}

// ── Personalized Horoscope ───────────────────────────────────────────

const MIN_BIRTH_YEAR = 1900

/** Birth data required by the personalized horoscope endpoint. */
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
 * Fetches a personalized daily horoscope based on the user's birth chart.
 *
 * Unlike `getDailyHoroscope`, this calls the personalized endpoint which
 * calculates current transits against the user's natal chart. The result
 * includes `personal.transits_top` with transit-specific insights.
 *
 * Always requests today's reading — the date is resolved server-side.
 *
 * Cache strategy: `cache: "no-store"`.
 * Each request is unique to a specific birth chart, so caching would
 * not benefit other users and could serve stale transit data.
 *
 * @param birth  Birth chart details (date, time, location)
 * @returns      Horoscope data with personal transits, or an error message
 */
// Cached fetcher — same birth data + same date always returns the same result.
// Revalidates every hour; in practice the result only changes day-to-day.
// "use cache" is used instead of fetch-level caching because Next.js does not
// cache POST requests in its Data Cache. The cache key is automatically derived
// from the serialized arguments, so different birth inputs produce different entries.
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
  // Basic validation before calling the API.
  // Use == null instead of ! to avoid false positives for 0 coordinates
  // (e.g., cities on the equator lat=0 or the Greenwich meridian lng=0).
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
    // Resolve today's date in YYYY-MM-DD format (UTC) for the API.
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
    return { error: "We couldn't load your personalized reading. Please try again." }
  }
}
