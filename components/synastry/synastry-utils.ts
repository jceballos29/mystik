import type {
  SynastryAspect,
  SynastryDomain,
} from "@/lib/validations/synastry.schema"

export function getPolarityLean(
  score: number
): "supportive" | "challenging" | "balanced" {
  if (score >= 0.35) return "supportive"
  if (score <= -0.35) return "challenging"
  return "balanced"
}

export function mapKeyToAspect(
  key: string,
  aspects: SynastryAspect[]
): SynastryAspect | undefined {
  return aspects.find((a) => a.key === key)
}

export function strengthLabel(strength: string): string {
  const labels: Record<string, string> = {
    very_strong: "Very Strong",
    strong: "Strong",
    moderate: "Moderate",
    mild: "Mild",
    weak: "Weak",
  }
  return labels[strength] ?? strength
}

export function normalizeScore(value: number): number {
  return Math.max(0, Math.min(100, value))
}

// Tailwind-safe hex values for domain colors (used in inline styles on SVG strokes)
export const DOMAIN_COLOR_HEX: Record<SynastryDomain, string> = {
  romance: "#fb7185", // rose-400
  communication: "#38bdf8", // sky-400
  stability: "#fbbf24", // amber-400
  intimacy: "#c084fc", // purple-400
  growth: "#34d399", // emerald-400
  tension: "#fb923c", // orange-400
}

export function domainColorHex(domain: string): string {
  return DOMAIN_COLOR_HEX[domain as SynastryDomain] ?? "#94a3b8"
}

// Tailwind class strings for domain chips
export const DOMAIN_CLASSES: Record<SynastryDomain, string> = {
  romance: "text-rose-400 border-rose-400/30 bg-rose-400/10",
  communication: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  stability: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  intimacy: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  growth: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  tension: "text-orange-400 border-orange-400/30 bg-orange-400/10",
}

export function domainClasses(domain: string): string {
  return (
    DOMAIN_CLASSES[domain as SynastryDomain] ??
    "text-star-dust-400 border-star-dust-600 bg-star-dust-800/50"
  )
}

export const DOMAIN_LABELS: Record<SynastryDomain, string> = {
  romance: "Romance",
  communication: "Communication",
  stability: "Stability",
  intimacy: "Intimacy",
  growth: "Growth",
  tension: "Tension",
}

export function domainLabel(domain: string): string {
  return DOMAIN_LABELS[domain as SynastryDomain] ?? domain
}
