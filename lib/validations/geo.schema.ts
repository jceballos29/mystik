/**
 * @module validations/geo.schema
 *
 * Esquema Zod para validar la respuesta del endpoint de geocodificación.
 * Incluye una transformación que normaliza el campo `country_code`
 * (que la API puede devolver como `country_code` o `country`)
 * y calcula `count` si no viene en la respuesta.
 */

import { z } from "zod"

// --- Esquema de Ciudad ---

/**
 * Esquema de una ciudad individual retornada por la API de geocodificación.
 *
 * Aplica un `transform` para normalizar el campo `country_code`:
 * la API puede devolver `country_code` (ISO 3166-1 alpha-2) o `country`
 * (nombre completo). Se prioriza `country_code` y se hace fallback a `country`.
 */
const upstreamCitySchema = z
  .object({
    name: z.string(),
    country: z.string().optional(),
    country_code: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
    timezone: z.string(),
    population: z.number().optional(),
  })
  .transform((city) => ({
    name: city.name,
    country_code: city.country_code ?? city.country ?? "",
    lat: city.lat,
    lng: city.lng,
    timezone: city.timezone,
    population: city.population,
  }))

// --- Esquema de Respuesta ---

/**
 * Esquema raíz de la respuesta del endpoint de geocodificación.
 * El campo `count` es opcional en la API; si no viene, se calcula
 * a partir de la longitud del array de resultados.
 */
export const geoSearchResponseSchema = z
  .object({
    results: z.array(upstreamCitySchema),
    count: z.number().int().nonnegative().optional(),
  })
  .transform((value) => ({
    results: value.results,
    count: value.count ?? value.results.length,
  }))

// --- Tipos Exportados ---

/** Tipo de una ciudad individual (después de la transformación). */
export type CityResult = z.infer<
  typeof geoSearchResponseSchema
>["results"][number]

/** Tipo de la respuesta completa de búsqueda geográfica. */
export type GeoSearchResponse = z.infer<typeof geoSearchResponseSchema>
