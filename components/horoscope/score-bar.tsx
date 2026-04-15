/**
 * @module components/horoscope/score-bar
 *
 * Barra de progreso horizontal que visualiza un puntaje de energía
 * (0–100) con su etiqueta cualitativa y razón explicativa opcional.
 * Se usa en las vistas de horóscopo diario y personalizado.
 */
import { getScoreLabel } from "@/lib/horoscope-utils"

/** Props del componente ScoreBar. */
interface ScoreBarProps {
  /** Nombre de la dimensión (ej. "love", "career"). */
  label: string
  /** Puntaje numérico de 0 a 100. */
  value: number
  /** Texto explicativo del factor que influye en este puntaje. */
  reason?: string | null
}

/**
 * Barra de progreso con etiqueta cualitativa y razón opcional.
 * El ancho de la barra se anima via CSS `transition-all`.
 */
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
