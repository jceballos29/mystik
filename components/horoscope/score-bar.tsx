import { getScoreLabel } from "@/lib/horoscope-utils"

interface ScoreBarProps {
  label: string
  value: number
  reason?: string | null
}

export function ScoreBar({ label, value, reason }: ScoreBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="w-16 shrink-0">
          <span className="text-[10px] font-bold tracking-[0.4em] text-star-dust-400 uppercase">
            {label}
          </span>
        </div>
        <div className="h-px flex-1 overflow-hidden bg-star-dust-800">
          <div
            className="h-full bg-koromiko-500 transition-all duration-700"
            style={{ width: `${value}%` }}
          />
        </div>
        <div className="flex flex-col items-end">
          <span className="w-8 text-right text-sm font-bold text-koromiko-400">
            {value}
          </span>
          <span className="text-[10px] tracking-[0.2em] text-star-dust-500 uppercase italic">
            {getScoreLabel(value)}
          </span>
        </div>
      </div>
      {reason && (
        <p className="pl-20 text-[11px] leading-relaxed font-medium text-star-dust-500">
          {reason}
        </p>
      )}
    </div>
  )
}
