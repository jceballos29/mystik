import type {
  HoroscopeLucky,
  HoroscopeScoreFactor,
} from "@/lib/validations/horoscope.schema"

export function formatLuckyTimeWindow(
  tw: HoroscopeLucky["time_window"]
): string {
  if (typeof tw === "string") return tw
  return tw.display
}

export function getScoreLabel(score: number): string {
  if (score < 25) return "Challenging"
  if (score < 45) return "Low support"
  if (score < 60) return "Mixed"
  if (score < 75) return "Supportive"
  return "Strong tailwind"
}

export function getFactorReason(
  factors: HoroscopeScoreFactor[],
  dim: string
): string | null {
  const factor = factors.find((f) => f.dimension === dim)
  if (!factor) return null
  if (typeof factor.reason === "string") return factor.reason
  return factor.reason.main
}
