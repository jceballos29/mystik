// "server-only" tells Next.js that this module can ONLY run on the
// server (Server Components, Server Actions, Route Handlers).
// If someone imports it from a "use client" module, the build fails with a clear error.
// Why it matters: this file contains the FreeAstroAPI API_KEY. Without this
// barrier, a client bundle could expose the key in the browser.
import "server-only"

// BASE_URL: the root URL for FreeAstroAPI. Can be overridden via env to
// point to a local/staging environment without touching the code.
// API_KEY: the private key that authenticates each request. Lives only on the server.
const BASE_URL =
  process.env.FREEASTROAPI_BASE_URL ?? "https://astro-api-1qnc.onrender.com"
const API_KEY = process.env.FREEASTROAPI_API_KEY

// How long (ms) we wait for the FreeAstroAPI response before aborting.
// FreeAstroAPI runs on Render with cold starts — without a timeout, a Server
// Component could hang indefinitely and block the page render.
const TIMEOUT_MS = 15_000

/**
 * Typed error representing any failure when communicating with FreeAstroAPI.
 *
 * Why a custom class instead of a generic `Error`:
 * Server Actions need to distinguish between "the API returned 404" vs
 * "no network connection" vs "timeout". With structured `status` and `code`,
 * the caller can decide what to show the user without parsing message strings.
 *
 * `toErrorResponse()` (below) also consumes it to build
 * correct HTTP responses from Route Handlers.
 */
export class ApiProxyError extends Error {
  constructor(
    /** Equivalent HTTP code (504 for timeout, 502 for network, etc.) */
    public status: number,
    /** Machine identifier for the error, e.g. "UPSTREAM_TIMEOUT" */
    public code: string,
    message: string,
    /** Optional payload returned by the upstream API (useful for debugging) */
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiProxyError"
  }
}

/**
 * Extension of the native `RequestInit` with Next.js cache options.
 *
 * Next.js extends the global `fetch` with `next.revalidate` and `next.tags`
 * to integrate with its Data Cache system. By typing the options here,
 * Server Actions can pass them directly without manual casts.
 *
 * Usage examples:
 * - `{ next: { revalidate: 3600 } }` → cache for 1 hour (daily horoscope)
 * - `{ cache: "no-store" }` → no cache (user personal data)
 */
type FetchOptions = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] }
}

/**
 * Main function to call FreeAstroAPI from the server.
 *
 * Why this abstraction exists instead of calling `fetch` directly
 * in each Server Action:
 * 1. Automatically injects the API key into every request.
 * 2. Converts all possible errors into `ApiProxyError` with a
 *    consistent contract — Server Actions never deal with raw
 *    network errors or have to inspect `response.ok`.
 * 3. Centralizes the timeout and base URL in a single place.
 *
 * Why native `fetch` instead of axios:
 * Next.js only extends the global `fetch` with its cache system
 * (`next.revalidate`, `cache: "no-store"`). With axios, an undocumented
 * hack via `fetchOptions` with a cast was necessary. Here, cache options
 * are passed natively without any magic.
 *
 * @param path     Path relative to BASE_URL, e.g. "/horoscope/daily/aries"
 * @param options  Standard RequestInit + optional Next.js cache options
 * @returns        The response body already typed as `T`
 * @throws         `ApiProxyError` under any error condition
 */
export async function astroFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  // Early validation: if the key is not configured, the error is ours,
  // not from the external API. Fails fast with 500 instead of receiving
  // a mysterious 401 from FreeAstroAPI.
  if (!API_KEY) {
    throw new ApiProxyError(
      500,
      "MISSING_API_KEY",
      "FREEASTROAPI_API_KEY is not configured"
    )
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        // The API key goes after options.headers so it cannot be
        // accidentally overridden by the caller.
        ...options.headers,
        "x-api-key": API_KEY,
      },
      // AbortSignal.timeout() is the standard Web API for timeouts —
      // no external dependencies and no need for manual cancellation.
      // Callers may pass their own signal (e.g. a longer timeout for cold-start
      // endpoints); if none is given, the default TIMEOUT_MS applies.
      signal: options.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    // fetch only throws on network errors or when the signal aborts.
    // DOMException with name "TimeoutError" = AbortSignal.timeout() expired.
    // Any other error = network failure (DNS, connection refused, etc.).
    const isTimeout =
      error instanceof DOMException && error.name === "TimeoutError"
    throw new ApiProxyError(
      isTimeout ? 504 : 502,
      isTimeout ? "UPSTREAM_TIMEOUT" : "UPSTREAM_NETWORK_ERROR",
      error instanceof Error ? error.message : "Unknown network error"
    )
  }

  // fetch does not throw on 4xx/5xx responses — you must check `response.ok`
  // explicitly. We try to read the JSON body to include it in `details`
  // as a debugging aid; if the parse fails, we ignore it.
  if (!response.ok) {
    const details = await response.json().catch(() => undefined)
    throw new ApiProxyError(
      response.status,
      `UPSTREAM_${response.status}`,
      `FreeAstroAPI responded with ${response.status}`,
      details
    )
  }

  return response.json() as Promise<T>
}

/**
 * Converts an error (ours or unknown) into an HTTP `Response` ready
 * to return from a Route Handler.
 *
 * Why it exists: Route Handlers must return `Response`, but
 * `astroFetch` throws `ApiProxyError`. This function bridges that gap.
 * Server Actions do NOT use this — they catch the error and return
 * `{ error: string }` directly.
 *
 * @example
 * // In a Route Handler:
 * try {
 *   const data = await astroFetch("/horoscope/daily/aries")
 *   return Response.json(data)
 * } catch (error) {
 *   return toErrorResponse(error)
 * }
 */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof ApiProxyError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    )
  }

  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
    { status: 500 }
  )
}
