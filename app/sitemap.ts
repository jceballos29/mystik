import type { MetadataRoute } from "next"
import { zodiacSigns } from "@/lib/zodiac-signs"

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://mystik.vercel.app"
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
