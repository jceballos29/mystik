/**
 * @module lib/translate/synastry
 *
 * Traduce todos los campos de texto libre de un `SynastryApiResponse`
 * usando la función `googleTranslate`. Los campos numéricos, slugs,
 * claves internas y puntajes se dejan intactos.
 *
 * Estrategia: mismos "slots" que en horoscope.ts — un array plano,
 * un único batch y reconstrucción por índice.
 */
import "server-only"

import { googleTranslate } from "@/lib/translate/client"
import type { SynastryApiResponse } from "@/lib/validations/synastry.schema"

/**
 * Traduce todos los campos narrativos de un `SynastryApiResponse`.
 *
 * Campos traducidos:
 * - `summary.archetype.label`, `.one_liner`
 * - `summary.narrative`
 * - `summary.strengths[]`, `summary.challenges[]`
 * - `summary.bands.theme`, `.core`, `.shadow`
 * - `summary.drivers_by_domain[*][].label`
 * - Por cada aspecto: `label`, `blocks.supportive.{title, one_liner, insight}`,
 *   `blocks.challenging.{title, one_liner, insight}`
 *
 * @param data   - Respuesta de sinastría en inglés.
 * @param locale - Código de idioma destino (ej. "es").
 * @returns Copia profunda con los campos de texto traducidos.
 */
export async function translateSynastryResponse(
  data: SynastryApiResponse,
  locale: string
): Promise<SynastryApiResponse> {
  const slots: string[] = []

  const push = (s: string): number => {
    const i = slots.length
    slots.push(s)
    return i
  }

  const pushArr = (arr: string[]): number => {
    const i = slots.length
    arr.forEach((s) => slots.push(s))
    return i
  }

  // --- Resumen (summary) ---
  const iArchLabel = push(data.summary.archetype.label)
  const iArchOneLiner = push(data.summary.archetype.one_liner)
  const iNarrative = push(data.summary.narrative)
  const iStrengthsStart = pushArr(data.summary.strengths)
  const iChallengesStart = pushArr(data.summary.challenges)

  // Bands (todos opcionales)
  const iBandTheme =
    data.summary.bands?.theme != null ? push(data.summary.bands.theme) : -1
  const iBandCore =
    data.summary.bands?.core != null ? push(data.summary.bands.core) : -1
  const iBandShadow =
    data.summary.bands?.shadow != null ? push(data.summary.bands.shadow) : -1

  // Drivers por dominio
  const driversByDomain = data.summary.drivers_by_domain ?? {}
  const driverDomains = Object.keys(driversByDomain)
  const driverSlots: Array<{ domain: string; start: number; count: number }> =
    []

  driverDomains.forEach((domain) => {
    const drivers = driversByDomain[domain] ?? []
    const start = slots.length
    drivers.forEach((d) => slots.push(d.label))
    driverSlots.push({ domain, start, count: drivers.length })
  })

  // --- Aspectos ---
  // Pre-inicializar con ceros para asegurarnos de que los índices son estables.
  const aspectSlots = data.aspects.map(() => ({
    iLabel: 0,
    iSuppTitle: 0,
    iSuppOneLiner: 0,
    iSuppInsight: 0,
    iChalTitle: 0,
    iChalOneLiner: 0,
    iChalInsight: 0,
  }))

  data.aspects.forEach((aspect, i) => {
    aspectSlots[i].iLabel = push(aspect.label)
    aspectSlots[i].iSuppTitle = push(aspect.blocks.supportive.title)
    aspectSlots[i].iSuppOneLiner = push(aspect.blocks.supportive.one_liner)
    aspectSlots[i].iSuppInsight = push(aspect.blocks.supportive.insight)
    aspectSlots[i].iChalTitle = push(aspect.blocks.challenging.title)
    aspectSlots[i].iChalOneLiner = push(aspect.blocks.challenging.one_liner)
    aspectSlots[i].iChalInsight = push(aspect.blocks.challenging.insight)
  })

  // --- Traducción en batch ---
  const t = await googleTranslate(slots, locale)

  // --- Reconstrucción de drivers ---
  const translatedDriversByDomain: typeof driversByDomain = {
    ...driversByDomain,
  }
  driverSlots.forEach(({ domain, start, count }) => {
    const originalDrivers = driversByDomain[domain] ?? []
    translatedDriversByDomain[domain] = originalDrivers.map((d, i) => ({
      ...d,
      label: t[start + i],
    }))
  })

  // --- Reconstrucción del objeto completo ---
  return {
    ...data,
    summary: {
      ...data.summary,
      archetype: {
        ...data.summary.archetype,
        label: t[iArchLabel],
        one_liner: t[iArchOneLiner],
      },
      narrative: t[iNarrative],
      strengths: data.summary.strengths.map((_, i) => t[iStrengthsStart + i]),
      challenges: data.summary.challenges.map(
        (_, i) => t[iChallengesStart + i]
      ),
      bands: data.summary.bands
        ? {
          ...data.summary.bands,
          theme: iBandTheme >= 0 ? t[iBandTheme] : data.summary.bands.theme,
          core: iBandCore >= 0 ? t[iBandCore] : data.summary.bands.core,
          shadow:
            iBandShadow >= 0 ? t[iBandShadow] : data.summary.bands.shadow,
        }
        : data.summary.bands,
      drivers_by_domain:
        driverDomains.length > 0 ? translatedDriversByDomain : driversByDomain,
    },
    aspects: data.aspects.map((aspect, i) => {
      const s = aspectSlots[i]
      return {
        ...aspect,
        label: t[s.iLabel],
        blocks: {
          supportive: {
            ...aspect.blocks.supportive,
            title: t[s.iSuppTitle],
            one_liner: t[s.iSuppOneLiner],
            insight: t[s.iSuppInsight],
          },
          challenging: {
            ...aspect.blocks.challenging,
            title: t[s.iChalTitle],
            one_liner: t[s.iChalOneLiner],
            insight: t[s.iChalInsight],
          },
        },
      }
    }),
  }
}
