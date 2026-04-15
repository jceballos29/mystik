/**
 * @module astro-api/client
 *
 * Cliente HTTP centralizado para todas las peticiones a FreeAstroAPI.
 * Importa "server-only" para garantizar a nivel de bundler que este módulo
 * nunca se incluya en el JavaScript del cliente, protegiendo así las
 * credenciales de la API.
 */
import "server-only"

// --- Configuración ---

/** URL base de la API externa. Se lee de la variable de entorno con un fallback de desarrollo. */
const BASE_URL =
  process.env.FREEASTROAPI_BASE_URL ?? "https://astro-api-1qnc.onrender.com"

/** Clave de autenticación inyectada en cada petición como header `x-api-key`. */
const API_KEY = process.env.FREEASTROAPI_API_KEY

/** Tiempo máximo de espera antes de abortar una petición (milisegundos). */
const TIMEOUT_MS = 15_000

// --- Errores ---

/**
 * Error personalizado para representar fallos en la comunicación con la API externa.
 * Encapsula el código HTTP, un código interno de error y detalles opcionales
 * del cuerpo de la respuesta, facilitando el mapeo uniforme de errores.
 */
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

// --- Tipos Internos ---

/** Opciones extendidas de `fetch` que incluyen la configuración de caché de Next.js. */
type FetchOptions = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] }
}

// --- Cliente HTTP ---

/**
 * Realiza una petición autenticada a FreeAstroAPI y retorna la respuesta deserializada.
 *
 * Actúa como el único punto de salida hacia la API externa. Inyecta automáticamente
 * el header `x-api-key`, aplica un timeout con `AbortSignal` y normaliza todos
 * los errores posibles (red, timeout, HTTP) a un `ApiProxyError` uniforme.
 *
 * @template T - Tipo esperado de la respuesta JSON.
 * @param path - Ruta relativa al endpoint (ej. `/api/v2/horoscope/daily/sign`).
 * @param options - Opciones de fetch, incluyendo configuración de caché de Next.js.
 * @returns Respuesta deserializada como tipo `T`.
 * @throws {ApiProxyError} Si la API key no está configurada, la petición falla o la respuesta no es 2xx.
 */
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

/**
 * Convierte cualquier error en una respuesta HTTP JSON estandarizada.
 * Útil en Route Handlers para mapear errores del proxy a respuestas REST.
 *
 * @param error - Error capturado (puede ser `ApiProxyError` o cualquier otro).
 * @returns `Response` con cuerpo JSON `{ error: { code, message } }` y status apropiado.
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
