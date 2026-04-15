import type {
  HoroscopeLucky,
  HoroscopeScoreFactor,
} from "@/lib/validations/horoscope.schema"

/** Format the lucky time window as a displayable string. */
export function formatLuckyTimeWindow(
  tw: HoroscopeLucky["time_window"]
): string {
  if (typeof tw === "string") return tw
  return tw.display
}

/** Descriptive label for a 0–100 energy score. */
export function getScoreLabel(score: number): string {
  if (score < 25) return "Challenging"
  if (score < 45) return "Low support"
  if (score < 60) return "Mixed"
  if (score < 75) return "Supportive"
  return "Strong tailwind"
}

/** Extract the reason text for a given dimension from the score_factors array. */
export function getFactorReason(
  factors: HoroscopeScoreFactor[],
  dim: string
): string | null {
  const factor = factors.find((f) => f.dimension === dim)
  if (!factor) return null
  if (typeof factor.reason === "string") return factor.reason
  return factor.reason.main
}
