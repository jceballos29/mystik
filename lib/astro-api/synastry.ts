/**
 * @module astro-api/synastry
 *
 * Server Action para calcular la sinastría (compatibilidad astrológica)
 * entre dos personas. Valida el payload de entrada, invoca el endpoint
 * de sinastría de FreeAstroAPI y valida la respuesta.
 */
"use server"

import { cacheLife } from "next/cache"

import { astroFetch } from "@/lib/astro-api/client"
import {
  synastryApiPayloadSchema,
  synastryApiResponseSchema,
  type SynastryApiPayload,
  type SynastryApiResponse,
} from "@/lib/validations/synastry.schema"

// --- Tipos e Interfaces ---

/** Resultado exitoso del cálculo de sinastría. */
interface SynastrySuccess {
  data: SynastryApiResponse
  error?: never
}

/** Resultado fallido del cálculo de sinastría. */
interface SynastryError {
  data?: never
  error: string
}

/** Unión discriminada para el resultado de la operación de sinastría. */
export type SynastryResult = SynastrySuccess | SynastryError

// --- Funciones Internas ---

/**
 * Invocación cacheada al endpoint de sinastría.
 * Se aísla en una función separada para que `"use cache"` solo aplique
 * al fetch y no a la validación del payload, que debe ejecutarse siempre.
 *
 * @param payload - Datos validados de ambas personas.
 * @returns Respuesta cruda de la API (sin validar).
 */
async function fetchSynastryFromAPI(payload: SynastryApiPayload) {
  "use cache"
  cacheLife("hours")
  return astroFetch<unknown>("/api/v1/western/synastrycards", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

// --- Acciones de Servidor ---

/**
 * Calcula el reporte de sinastría entre dos personas.
 *
 * Flujo:
 * 1. Valida el payload completo con `synastryApiPayloadSchema.safeParse()`
 * 2. Invoca el endpoint de sinastría (cacheado por horas)
 * 3. Valida la respuesta de la API con `synastryApiResponseSchema.safeParse()`
 *
 * @param payload - Datos de ambas personas: nombre, datetime, timezone y ubicación.
 * @returns Reporte de sinastría con resumen, scores y aspectos, o un error descriptivo.
 */
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
