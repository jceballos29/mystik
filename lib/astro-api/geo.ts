/**
 * @module astro-api/geo
 *
 * Server Action para búsqueda de ciudades mediante geocodificación.
 * Se utiliza en los formularios de sinastría y horóscopo personalizado
 * para obtener las coordenadas y timezone del lugar de nacimiento.
 */
"use server"

import { astroFetch } from "@/lib/astro-api/client"
import {
  geoSearchResponseSchema,
  type GeoSearchResponse,
} from "@/lib/validations/geo.schema"

// --- Tipos e Interfaces ---

/** Resultado exitoso de la búsqueda de ciudades. */
interface GeoSuccess {
  data: GeoSearchResponse
  error?: never
}

/** Resultado fallido de la búsqueda de ciudades. */
interface GeoError {
  data?: never
  error: string
}

/** Unión discriminada para el resultado de la búsqueda geográfica. */
export type GeoResult = GeoSuccess | GeoError

// --- Configuración ---

/**
 * Timeout extendido para geocodificación (30s).
 * La búsqueda de ciudades puede ser lenta especialmente en cold starts
 * del servicio externo, por lo que se usa un timeout mayor al default.
 */
const GEO_SEARCH_TIMEOUT_MS = 30_000

// --- Acciones de Servidor ---

/**
 * Busca ciudades por nombre usando el servicio de geocodificación de FreeAstroAPI.
 *
 * Retorna un array vacío (sin error) si el query es demasiado corto (< 2 caracteres),
 * evitando búsquedas excesivamente amplias. No utiliza caché (`no-store`) porque
 * las búsquedas son de alta variabilidad y necesitan resultados frescos.
 *
 * @param query - Texto de búsqueda ingresado por el usuario.
 * @returns Lista de ciudades con coordenadas y timezone, o un error descriptivo.
 */
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
