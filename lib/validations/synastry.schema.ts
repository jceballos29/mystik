/**
 * @module validations/synastry.schema
 *
 * Esquemas Zod para validar el payload de entrada y la respuesta de la API
 * de sinastría. Incluye transformaciones (`transform`) para normalizar
 * formatos polimórficos que la API puede devolver (ej. scores como array u objeto).
 */

import { z } from "zod"

// --- Dominios ---

/**
 * Dominios de compatibilidad evaluados en la sinastría.
 * Se definen como constante para reutilizarlos como tipo literal
 * y como iterador en la UI.
 */
export const DOMAINS = [
  "romance",
  "communication",
  "stability",
  "intimacy",
  "growth",
  "tension",
] as const

/** Tipo literal que representa un dominio de sinastría válido. */
export type SynastryDomain = (typeof DOMAINS)[number]

// --- Payload de Entrada ---

/**
 * Esquema de una persona para el cálculo de sinastría.
 * El `datetime` debe incluir segundos (`YYYY-MM-DDTHH:mm:ss`)
 * y el `tz_str` debe ser un identificador IANA válido.
 */
export const synastryPersonInputSchema = z.object({
  name: z.string().optional(),
  datetime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, {
    message: "Expected format: YYYY-MM-DDTHH:mm:ss",
  }),
  tz_str: z.string().min(1),
  location: z.object({
    city: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
  }),
})

/** Payload completo para el endpoint de sinastría: dos personas. */
export const synastryApiPayloadSchema = z.object({
  person_a: synastryPersonInputSchema,
  person_b: synastryPersonInputSchema,
})

export type SynastryPersonInput = z.infer<typeof synastryPersonInputSchema>
export type SynastryApiPayload = z.infer<typeof synastryApiPayloadSchema>

// --- Respuesta de la API ---

/** Metadata del reporte generado. */
const metaSchema = z.object({
  calculation: z
    .object({
      zodiac: z.string().optional(),
      house_system: z.string().optional(),
    })
    .optional(),
  generated_at: z.string(),
  report_id: z.string().optional(),
})

/** Arquetipo de la relación: una clasificación interpretativa de la dinámica de pareja. */
const archetypeSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  confidence: z.number().optional(),
  one_liner: z.string(),
})

/** Puntaje de un dominio específico con dirección opcional de tendencia. */
const scoreItemSchema = z.object({
  key: z.string(),
  value: z.number(),
  direction: z.string().optional(),
})

/** Aspecto o tránsito que contribuye al puntaje de un dominio. */
const driverItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  contribution: z.number(),
})

/** Bandas narrativas que describen la dinámica core y shadow de la relación. */
const synastryBandsSchema = z.object({
  rules_version: z.string().optional(),
  theme: z.string().optional(),
  core: z.string().optional(),
  shadow: z.string().optional(),
})

/**
 * Resumen del reporte de sinastría.
 *
 * Contiene dos transformaciones importantes:
 * - `scores`: Normaliza array u objeto `Record<string, number>` a array uniforme.
 *   La API puede devolver ambos formatos según la versión del motor.
 * - `drivers_by_domain`: Filtra strings sueltos que pueden aparecer
 *   mezclados con objetos driver en versiones antiguas de la API.
 */
const summarySchema = z.object({
  archetype: archetypeSchema,
  scores: z
    .union([z.array(scoreItemSchema), z.record(z.string(), z.number())])
    .transform((v): z.infer<typeof scoreItemSchema>[] =>
      Array.isArray(v)
        ? v
        : Object.entries(v).map(([key, value]) => ({ key, value }))
    ),
  strengths: z.array(z.string()),
  challenges: z.array(z.string()),
  narrative: z.string(),
  bands: synastryBandsSchema.optional(),
  drivers_by_domain: z
    .record(z.string(), z.array(z.union([driverItemSchema, z.string()])))
    .transform(
      (record): Record<string, z.infer<typeof driverItemSchema>[]> =>
        Object.fromEntries(
          Object.entries(record).map(([domain, drivers]) => [
            domain,
            drivers.filter(
              (d): d is z.infer<typeof driverItemSchema> =>
                typeof d !== "string"
            ),
          ])
        )
    )
    .optional(),
})

// --- Aspectos ---

/** Bloque narrativo de un aspecto: título, resumen y análisis detallado. */
const blockSchema = z.object({
  title: z.string(),
  one_liner: z.string(),
  insight: z.string(),
})

/**
 * Aspecto astrológico entre las cartas natales de ambas personas.
 * `strength` se normaliza a string porque la API puede devolver
 * tanto un string descriptivo como un valor numérico.
 */
const aspectSchema = z.object({
  key: z.string(),
  aspect_id: z.string().optional(),
  label: z.string(),
  rank: z.number(),
  strength: z.union([z.string(), z.number()]).transform(String),
  strength_value: z.number().optional(),
  polarity: z.string(),
  polarity_score: z.number(),
  abs_polarity: z.number(),
  dominant: z.string().optional(),
  domains: z.array(z.string()),
  display_policy: z.string(),
  default_block: z.string(),
  blocks: z.object({
    supportive: blockSchema,
    challenging: blockSchema,
  }),
})

// --- Esquema Raíz ---

/**
 * Esquema completo de la respuesta de la API de sinastría.
 * Incluye metadata del cálculo, resumen con puntajes y
 * la lista completa de aspectos entre ambas cartas.
 */
export const synastryApiResponseSchema = z.object({
  meta: metaSchema,
  summary: summarySchema,
  aspects: z.array(aspectSchema),
})

// --- Tipos Exportados ---

export type SynastryApiResponse = z.infer<typeof synastryApiResponseSchema>
export type SynastrySummary = z.infer<typeof summarySchema>
export type SynastryAspect = z.infer<typeof aspectSchema>
export type SynastryScoreItem = z.infer<typeof scoreItemSchema>
export type SynastryDriverItem = z.infer<typeof driverItemSchema>
export type SynastryBlock = z.infer<typeof blockSchema>
export type SynastryBands = z.infer<typeof synastryBandsSchema>
