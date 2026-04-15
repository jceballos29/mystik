"use client"

import { motion } from "framer-motion"

import { svgCircumference, formatLocalDate } from "@/lib/utils"
import type {
  SynastrySummary,
  SynastryApiPayload,
} from "@/lib/validations/synastry.schema"

interface SummaryHeaderProps {
  summary: SynastrySummary
  payload?: SynastryApiPayload
}

export function SummaryHeader({ summary, payload }: SummaryHeaderProps) {
  const overallScore = summary.scores.find((s) => s.key === "overall")
  const overallValue = overallScore?.value ?? 0
  const circumference = svgCircumference(42) // r=42

  return (
    <section className="px-6 pt-16 pb-24">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Archetype badge */}
          <span className="mb-4 inline-block text-[10px] font-bold tracking-[0.4em] text-koromiko-400/60 uppercase">
            Connection Archetype
          </span>

          <h1 className="font-title mb-3 text-4xl text-foreground sm:text-5xl md:text-6xl">
            {summary.archetype.label}
          </h1>

          <p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground italic">
            {summary.archetype.one_liner}
          </p>

          {/* Person details */}
          {payload && (
            <div className="mb-12 flex flex-col justify-center gap-6 font-mono text-xs text-muted-foreground sm:flex-row sm:gap-12">
              <div className="flex flex-col items-center">
                <span className="mb-1 text-[10px] font-bold tracking-[0.4em] text-koromiko-400/60 uppercase">
                  {payload.person_a.name || "Person A"}
                </span>
                <span>{payload.person_a.location.city}</span>
                <span>{formatLocalDate(payload.person_a.datetime)}</span>
              </div>
              <div className="hidden w-px bg-star-dust-700 sm:block" />
              <div className="flex flex-col items-center">
                <span className="mb-1 text-[10px] font-bold tracking-[0.4em] text-koromiko-400/60 uppercase">
                  {payload.person_b.name || "Person B"}
                </span>
                <span>{payload.person_b.location.city}</span>
                <span>{formatLocalDate(payload.person_b.datetime)}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Overall score ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex flex-col items-center"
        >
          <div className="relative mb-3 h-28 w-28">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full -rotate-90"
              aria-label={`Overall score: ${Math.round(overallValue)}`}
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-star-dust-700"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-koromiko-400"
                strokeLinecap="round"
                strokeDasharray={`${(overallValue / 100) * circumference} ${circumference - (overallValue / 100) * circumference}`}
                strokeDashoffset="0"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-title text-3xl text-foreground">
                {Math.round(overallValue)}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase">
            Overall
          </span>
        </motion.div>

        {/* Narrative */}
        {summary.narrative && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-auto mt-10 mb-12 max-w-xl text-sm leading-relaxed text-muted-foreground"
          >
            {summary.narrative}
          </motion.p>
        )}

        {/* Synastry Bands */}
        {summary.bands && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mx-auto mt-12 max-w-xl border-t border-star-dust-700 pt-12"
          >
            <div className="space-y-3 text-left">
              <div className="border border-l-2 border-star-dust-700 border-l-koromiko-500/40 bg-card p-4">
                <span className="mb-1 block text-[10px] font-bold tracking-[0.4em] text-koromiko-400/60 uppercase">
                  Bond Tone
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {summary.bands.theme}
                </p>
              </div>
              <div className="border border-l-2 border-star-dust-700 border-l-emerald-500/40 bg-card p-4">
                <span className="mb-1 block text-[10px] font-bold tracking-[0.4em] text-emerald-400/60 uppercase">
                  Core Dynamic
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {summary.bands.core}
                </p>
              </div>
              <div className="border border-l-2 border-star-dust-700 border-l-rose-500/40 bg-card p-4">
                <span className="mb-1 block text-[10px] font-bold tracking-[0.4em] text-rose-400/60 uppercase">
                  Watch For
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {summary.bands.shadow}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
