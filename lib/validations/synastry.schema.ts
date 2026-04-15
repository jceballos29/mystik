import { z } from "zod"

export const DOMAINS = [
  "romance",
  "communication",
  "stability",
  "intimacy",
  "growth",
  "tension",
] as const

export type SynastryDomain = (typeof DOMAINS)[number]

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

export const synastryApiPayloadSchema = z.object({
  person_a: synastryPersonInputSchema,
  person_b: synastryPersonInputSchema,
})

export type SynastryPersonInput = z.infer<typeof synastryPersonInputSchema>
export type SynastryApiPayload = z.infer<typeof synastryApiPayloadSchema>

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

const archetypeSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  confidence: z.number().optional(),
  one_liner: z.string(),
})

const scoreItemSchema = z.object({
  key: z.string(),
  value: z.number(),
  direction: z.string().optional(),
})

const driverItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  contribution: z.number(),
})

const synastryBandsSchema = z.object({
  rules_version: z.string().optional(),
  theme: z.string().optional(),
  core: z.string().optional(),
  shadow: z.string().optional(),
})

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

const blockSchema = z.object({
  title: z.string(),
  one_liner: z.string(),
  insight: z.string(),
})

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

export const synastryApiResponseSchema = z.object({
  meta: metaSchema,
  summary: summarySchema,
  aspects: z.array(aspectSchema),
})

export type SynastryApiResponse = z.infer<typeof synastryApiResponseSchema>
export type SynastrySummary = z.infer<typeof summarySchema>
export type SynastryAspect = z.infer<typeof aspectSchema>
export type SynastryScoreItem = z.infer<typeof scoreItemSchema>
export type SynastryDriverItem = z.infer<typeof driverItemSchema>
export type SynastryBlock = z.infer<typeof blockSchema>
export type SynastryBands = z.infer<typeof synastryBandsSchema>
