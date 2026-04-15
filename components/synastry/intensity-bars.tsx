import { getPolarityLean } from "@/components/synastry/synastry-utils"

interface IntensityBarsProps {
  score: number
  className?: string
}

export function IntensityBars({ score, className = "" }: IntensityBarsProps) {
  const absScore = Math.abs(score)
  const lean = getPolarityLean(score)
  const colorClass =
    lean === "supportive"
      ? "bg-emerald-400"
      : lean === "challenging"
        ? "bg-rose-400"
        : "bg-koromiko-400"

  const bars = 5
  const filledBars = Math.ceil(absScore * bars) || 1

  return (
    <div
      className={`flex gap-0.5 ${className}`}
      aria-label={`Intensity: ${Math.round(absScore * 100)}%`}
    >
      {[...Array(bars)].map((_, i) => (
        <div
          key={i}
          className={`h-3 w-1 rounded-[1px] ${i < filledBars ? colorClass : "bg-star-dust-700/40"}`}
        />
      ))}
    </div>
  )
}
