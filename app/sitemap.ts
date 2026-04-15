/**
 * @module app/sitemap
 *
 * Genera el sitemap XML dinámicamente. Incluye la landing page (prioridad 1)
 * y las 12 rutas de horóscopo por signo (prioridad 0.8). Ambas con
 * `changeFrequency: "daily"` porque el contenido se actualiza diariamente.
 * La URL base se obtiene de `NEXT_PUBLIC_SITE_URL` con fallback a Vercel.
 */
import type { MetadataRoute } from "next"
import { zodiacSigns } from "@/lib/zodiac-signs"

/**
 * Genera las entradas del sitemap.
 * Las rutas de horóscopo se generan dinámicamente desde el catálogo de signos.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mystik.vercel.app"
  const buildDate = new Date()

  return [
    {
      url: base,
      lastModified: buildDate,
      changeFrequency: "daily",
      priority: 1,
    },
    ...zodiacSigns.map((sign) => ({
      url: `${base}/horoscope/${sign.id}`,
      lastModified: buildDate,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ]
}
