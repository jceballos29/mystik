/**
 * @module lib/translate/horoscope
 *
 * Traduce todos los campos de texto libre de un objeto `HoroscopeData`
 * usando la función `googleTranslate`. Los campos numéricos, slugs y
 * claves internas se dejan intactos.
 *
 * Estrategia: se recolectan todos los strings en un array plano ("slots"),
 * se traducen en un único batch y se reconstruye el objeto original
 * asignando cada slot de vuelta a su posición.
 */
import "server-only"

import { googleTranslate } from "@/lib/translate/client"
import type { HoroscopeData } from "@/lib/validations/horoscope.schema"

/**
 * Traduce todos los campos narrativos de un `HoroscopeData` al idioma destino.
 *
 * Campos traducidos:
 * - `content.text`, `content.theme`, `content.keywords`, `content.do`,
 *   `content.dont`, `content.supporting_insights`
 * - `astro.moon_sign.label`, `astro.moon_phase.label`, `astro.highlights[].label`
 * - `score_factors[].reason` (string o `{main, secondary}`)
 * - `personal.transits_top[].explanation` (string o `{main, supporting[], tags[]}`)
 * - `personal.focus_areas[]`
 *
 * Si la traducción falla, el error se propaga al llamador que puede
 * optar por devolver el objeto original (en inglés) como fallback.
 *
 * @param data   - Datos del horóscopo en inglés.
 * @param locale - Código de idioma destino (ej. "es").
 * @returns Copia profunda de `data` con los campos de texto traducidos.
 */
export async function translateHoroscopeData(
  data: HoroscopeData,
  locale: string
): Promise<HoroscopeData> {
  const slots: string[] = []

  /** Añade un string al batch y devuelve su índice. */
  const push = (s: string): number => {
    const i = slots.length
    slots.push(s)
    return i
  }

  /** Añade un array de strings y devuelve el índice del primer elemento. */
  const pushArr = (arr: string[]): number => {
    const i = slots.length
    arr.forEach((s) => slots.push(s))
    return i
  }

  // --- Campos individuales ---
  const iContentText = push(data.content.text)
  const iContentTheme = push(data.content.theme)
  const iMoonSignLabel = push(data.astro.moon_sign.label)
  const iMoonPhaseLabel = push(data.astro.moon_phase.label)

  // --- Arrays ---
  const iKeywords = pushArr(data.content.keywords)

  const doArr = data.content.do ?? []
  const iDo = pushArr(doArr)

  const dontArr = data.content.dont ?? []
  const iDont = pushArr(dontArr)

  const supportingArr = data.content.supporting_insights ?? []
  const iSupporting = pushArr(supportingArr)

  const iHighlights = pushArr(data.astro.highlights.map((h) => h.label))

  // --- Score factor reasons (polimórfico: string | {main, secondary}) ---
  type FactorSlot =
    | { kind: "string"; i: number }
    | { kind: "object"; iMain: number; iSec: number | null }

  const factorSlots: FactorSlot[] = data.score_factors.map((f) => {
    if (typeof f.reason === "string") {
      return { kind: "string", i: push(f.reason) }
    }
    const iMain = push(f.reason.main)
    const iSec = f.reason.secondary ? push(f.reason.secondary) : null
    return { kind: "object", iMain, iSec }
  })

  // --- Tránsitos personalizados (polimórfico: string | {main, supporting[], tags[]}) ---
  type TransitSlot =
    | { kind: "string"; i: number }
    | {
      kind: "object"
      iMain: number
      iSuppStart: number
      suppCount: number
      iTagsStart: number
      tagsCount: number
    }

  const transitSlots: TransitSlot[] = (
    data.personal?.transits_top ?? []
  ).map((transit) => {
    if (typeof transit.explanation === "string") {
      return { kind: "string", i: push(transit.explanation) }
    }
    const iMain = push(transit.explanation.main)
    const supp = transit.explanation.supporting ?? []
    const iSuppStart = pushArr(supp)
    const tags = transit.explanation.tags ?? []
    const iTagsStart = pushArr(tags)
    return {
      kind: "object",
      iMain,
      iSuppStart,
      suppCount: supp.length,
      iTagsStart,
      tagsCount: tags.length,
    }
  })

  const focusAreasArr = data.personal?.focus_areas ?? []
  const iFocusAreas = pushArr(focusAreasArr)

  // --- Traducción en batch ---
  const t = await googleTranslate(slots, locale)

  // --- Reconstrucción ---
  return {
    ...data,
    content: {
      ...data.content,
      text: t[iContentText],
      theme: t[iContentTheme],
      keywords: data.content.keywords.map((_, i) => t[iKeywords + i]),
      do: doArr.length > 0 ? doArr.map((_, i) => t[iDo + i]) : data.content.do,
      dont:
        dontArr.length > 0
          ? dontArr.map((_, i) => t[iDont + i])
          : data.content.dont,
      supporting_insights:
        supportingArr.length > 0
          ? supportingArr.map((_, i) => t[iSupporting + i])
          : data.content.supporting_insights,
    },
    astro: {
      ...data.astro,
      moon_sign: { ...data.astro.moon_sign, label: t[iMoonSignLabel] },
      moon_phase: { ...data.astro.moon_phase, label: t[iMoonPhaseLabel] },
      highlights: data.astro.highlights.map((h, i) => ({
        ...h,
        label: t[iHighlights + i],
      })),
    },
    score_factors: data.score_factors.map((f, i) => {
      const slot = factorSlots[i]
      const reason =
        slot.kind === "string"
          ? t[slot.i]
          : {
            ...(typeof f.reason === "object" ? f.reason : {}),
            main: t[slot.iMain],
            secondary: slot.iSec !== null ? t[slot.iSec] : null,
          }
      return { ...f, reason }
    }),
    personal: data.personal
      ? {
        ...data.personal,
        transits_top: data.personal.transits_top.map((transit, i) => {
          const slot = transitSlots[i]
          if (slot.kind === "string") {
            return { ...transit, explanation: t[slot.i] }
          }
          return {
            ...transit,
            explanation: {
              ...(typeof transit.explanation === "object"
                ? transit.explanation
                : {}),
              main: t[slot.iMain],
              supporting:
                slot.suppCount > 0
                  ? Array.from({ length: slot.suppCount }, (_, j) =>
                    t[slot.iSuppStart + j]
                  )
                  : undefined,
              tags:
                slot.tagsCount > 0
                  ? Array.from({ length: slot.tagsCount }, (_, j) =>
                    t[slot.iTagsStart + j]
                  )
                  : undefined,
            },
          }
        }),
        focus_areas:
          focusAreasArr.length > 0
            ? focusAreasArr.map((_, i) => t[iFocusAreas + i])
            : data.personal.focus_areas,
      }
      : undefined,
  }
}
