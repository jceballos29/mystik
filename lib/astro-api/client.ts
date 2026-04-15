import "server-only"

const BASE_URL =
  process.env.FREEASTROAPI_BASE_URL ?? "https://astro-api-1qnc.onrender.com"
const API_KEY = process.env.FREEASTROAPI_API_KEY

const TIMEOUT_MS = 15_000

export class ApiProxyError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiProxyError"
  }
}

type FetchOptions = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] }
}

export async function astroFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
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
        ...options.headers,
        "x-api-key": API_KEY,
      },
      signal: options.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    const isTimeout =
      error instanceof DOMException && error.name === "TimeoutError"
    throw new ApiProxyError(
      isTimeout ? 504 : 502,
      isTimeout ? "UPSTREAM_TIMEOUT" : "UPSTREAM_NETWORK_ERROR",
      error instanceof Error ? error.message : "Unknown network error"
    )
  }

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
