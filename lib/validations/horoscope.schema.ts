import { z } from "zod"

// ── Reusable primitives ──────────────────────────────────────────────

const keyLabelSchema = z.object({
  key: z.string(),
  label: z.string(),
})

// ── Scores ───────────────────────────────────────────────────────────

export const horoscopeScoresSchema = z.object({
  overall: z.number().optional(),
  love: z.number(),
  career: z.number(),
  money: z.number(),
  health: z.number(),
})

// ── Score Factors ────────────────────────────────────────────────────

const scoreDriverSchema = z.object({
  type: z.string(),
  key: z.string(),
  label: z.string().optional(),
  weight: z.number().optional(),
  intensity: z.string().optional(),
  value: z.number().optional(),
  orb_deg: z.number().optional(),
})

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

// ── Lucky ────────────────────────────────────────────────────────────

const luckyTimeWindowSchema = z.object({
  display: z.string(),
  start: z.string(),
  end: z.string(),
  tz: z.string().optional(),
})

export const horoscopeLuckySchema = z.object({
  color: keyLabelSchema,
  number: z.number(),
  time_window: z.union([z.string(), luckyTimeWindowSchema]),
})

// ── Content ──────────────────────────────────────────────────────────

export const horoscopeContentSchema = z.object({
  text: z.string(),
  theme: z.string(),
  keywords: z.array(z.string()),
  do: z.array(z.string()).optional(),
  dont: z.array(z.string()).optional(),
  supporting_insights: z.array(z.string()).optional(),
})

// ── Astro ────────────────────────────────────────────────────────────

const highlightSchema = z.object({
  type: z.string(),
  key: z.string(),
  label: z.string(),
})

export const horoscopeAstroSchema = z.object({
  moon_sign: keyLabelSchema,
  moon_phase: keyLabelSchema,
  highlights: z.array(highlightSchema),
})

// ── Personal (personalized horoscope only) ───────────────────────────

const transitExplanationSchema = z.object({
  main: z.string(),
  supporting: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

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

const personalSchema = z.object({
  transits_top: z.array(transitSchema),
  focus_areas: z.array(z.string()).optional(),
  confidence_score: z.number().optional(),
})

// ── Scores Meta ──────────────────────────────────────────────────────

const scoresMetaSchema = z.object({
  overall_method: z.string(),
  weights: z.record(z.string(), z.number()),
  rounding: z.string(),
})

// ── Horoscope Data ───────────────────────────────────────────────────

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

// ── Meta ─────────────────────────────────────────────────────────────

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

// ── Full API Response ────────────────────────────────────────────────

export const horoscopeApiResponseSchema = z.object({
  meta: horoscopeMetaSchema,
  data: horoscopeDataSchema,
})

// ── Inferred Types ───────────────────────────────────────────────────

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
