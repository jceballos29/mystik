/**
 * @module validations/horoscope.schema
 *
 * Esquemas Zod para validar las respuestas de la API de horóscopos.
 * Cubre tanto el horóscopo diario por signo como las lecturas personalizadas
 * con tránsitos natales. Los tipos inferidos se exportan para uso en toda la aplicación.
 */

import { z } from "zod"

// --- Esquemas Primitivos ---

/** Par clave-etiqueta reutilizado en planetas, fases lunares, aspectos, etc. */
const keyLabelSchema = z.object({
  key: z.string(),
  label: z.string(),
})

// --- Puntajes ---

/** Puntajes de energía diaria. `overall` es opcional porque algunas respuestas no lo incluyen. */
export const horoscopeScoresSchema = z.object({
  overall: z.number().optional(),
  love: z.number(),
  career: z.number(),
  money: z.number(),
  health: z.number(),
})

/**
 * Driver que contribuye a un factor de puntaje.
 * Representa un tránsito o aspecto planetario que influye en la puntuación.
 */
const scoreDriverSchema = z.object({
  type: z.string(),
  key: z.string(),
  label: z.string().optional(),
  weight: z.number().optional(),
  intensity: z.string().optional(),
  value: z.number().optional(),
  orb_deg: z.number().optional(),
})

/**
 * Factor explicativo de un puntaje.
 * El campo `reason` puede venir como string directo o como objeto
 * con `main` y `secondary` — se normaliza en las utilidades de presentación.
 */
const scoreFactorSchema = z.object({
  dimension: z.string(),
  type: z.string().optional(),
  reason: z.union([
    z.string(),
    z.object({
      main: z.string(),
      secondary: z.string().nullable().optional(),
    }),
  ]),
  drivers: z.array(scoreDriverSchema).optional(),
})

// --- Elementos de Suerte ---

/** Estructura de ventana de tiempo de la suerte (formato enriquecido). */
const luckyTimeWindowSchema = z.object({
  display: z.string(),
  start: z.string(),
  end: z.string(),
  tz: z.string().optional(),
})

/**
 * Elementos de suerte del día.
 * `time_window` puede ser un string simple o un objeto con detalle completo,
 * dependiendo de la versión de la API que responda.
 */
export const horoscopeLuckySchema = z.object({
  color: keyLabelSchema,
  number: z.number(),
  time_window: z.union([z.string(), luckyTimeWindowSchema]),
})

// --- Contenido Narrativo ---

/**
 * Contenido narrativo del horóscopo.
 * Incluye el texto principal, tema, keywords y listas opcionales
 * de recomendaciones positivas (do) y negativas (dont).
 */
export const horoscopeContentSchema = z.object({
  text: z.string(),
  theme: z.string(),
  keywords: z.array(z.string()),
  do: z.array(z.string()).optional(),
  dont: z.array(z.string()).optional(),
  supporting_insights: z.array(z.string()).optional(),
})

// --- Contexto Astronómico ---

/** Evento o aspecto destacado del cielo actual. */
const highlightSchema = z.object({
  type: z.string(),
  key: z.string(),
  label: z.string(),
})

/** Contexto astronómico del día: fase lunar, signo lunar y aspectos destacados. */
export const horoscopeAstroSchema = z.object({
  moon_sign: keyLabelSchema,
  moon_phase: keyLabelSchema,
  highlights: z.array(highlightSchema),
})

// --- Tránsitos Natales (Lecturas Personalizadas) ---

/**
 * Estructura de la explicación de un tránsito.
 * Puede incluir puntos de guía adicionales (`supporting`) y
 * etiquetas temáticas (`tags`) para categorización.
 */
const transitExplanationSchema = z.object({
  main: z.string(),
  supporting: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

/**
 * Tránsito planetario sobre la carta natal del usuario.
 * La `explanation` puede ser un string simple (versiones antiguas)
 * o un objeto estructurado con guía y tags.
 */
const transitSchema = z.object({
  transit_planet: keyLabelSchema,
  natal_planet: keyLabelSchema,
  aspect: keyLabelSchema,
  orb_deg: z.number(),
  score: z.number(),
  explanation: z.union([z.string(), transitExplanationSchema]),
  is_applying: z.boolean(),
  exact_at: z.string().nullable().optional(),
})

/** Datos personalizados basados en la carta natal del usuario. */
const personalSchema = z.object({
  transits_top: z.array(transitSchema),
  focus_areas: z.array(z.string()).optional(),
  confidence_score: z.number().optional(),
})

// --- Metadata ---

/** Metadata sobre la metodología de cálculo de puntajes. */
const scoresMetaSchema = z.object({
  overall_method: z.string(),
  weights: z.record(z.string(), z.number()),
  rounding: z.string(),
})

// --- Esquema Principal ---

/**
 * Esquema completo de los datos del horóscopo.
 * `personal` solo está presente en lecturas personalizadas (no en horóscopos por signo).
 */
export const horoscopeDataSchema = z.object({
  sign: z.string(),
  date: z.string(),
  scores: horoscopeScoresSchema,
  score_factors: z.array(scoreFactorSchema),
  lucky: horoscopeLuckySchema,
  content: horoscopeContentSchema,
  astro: horoscopeAstroSchema,
  personal: personalSchema.optional(),
  scores_meta: scoresMetaSchema.optional(),
})

/** Metadata de la petición: request_id, fecha resuelta, motor de cálculo y caché. */
export const horoscopeMetaSchema = z.object({
  request_id: z.string(),
  generated_at: z.string(),
  settings: z.object({
    tz_str: z.string().optional(),
    timezone: z.string().optional(),
    locale: z.string().optional(),
    date_resolved: z.string(),
    orb_policy: z.string().optional(),
  }),
  cache: z
    .object({
      hit: z.boolean(),
      ttl_seconds: z.number(),
    })
    .optional(),
  engine: z.object({
    name: z.string(),
    version: z.string(),
  }),
})

/**
 * Esquema raíz de la respuesta de la API de horóscopos.
 * Valida la estructura completa `{ meta, data }` antes de
 * que los datos se propaguen a los componentes de presentación.
 */
export const horoscopeApiResponseSchema = z.object({
  meta: horoscopeMetaSchema,
  data: horoscopeDataSchema,
})

// --- Tipos Exportados ---

export type HoroscopeData = z.infer<typeof horoscopeDataSchema>
export type HoroscopeScores = z.infer<typeof horoscopeScoresSchema>
export type HoroscopeLucky = z.infer<typeof horoscopeLuckySchema>
export type HoroscopeContent = z.infer<typeof horoscopeContentSchema>
export type HoroscopeAstro = z.infer<typeof horoscopeAstroSchema>
export type HoroscopeMeta = z.infer<typeof horoscopeMetaSchema>
export type HoroscopeApiResponse = z.infer<typeof horoscopeApiResponseSchema>
export type HoroscopeScoreFactor = z.infer<typeof scoreFactorSchema>
export type HoroscopeTransit = z.infer<typeof transitSchema>
export type HoroscopePersonal = z.infer<typeof personalSchema>
