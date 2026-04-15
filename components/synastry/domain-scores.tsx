/**
 * @module components/synastry/domain-scores
 *
 * Grilla de puntajes por dominio de sinastría (6 dominios) mostrados
 * como anillos SVG circulares. Incluye tooltips con los "top drivers"
 * (aspectos que más contribuyen al puntaje) que aparecen al hacer hover.
 */
"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"

import {
  normalizeScore,
  domainColorHex,
  domainLabel,
} from "@/components/synastry/synastry-utils"
import { svgCircumference } from "@/lib/utils"
import type {
  SynastrySummary,
  SynastryDriverItem,
} from "@/lib/validations/synastry.schema"

interface DomainScoresProps {
  summary: SynastrySummary
}

export function DomainScores({ summary }: DomainScoresProps) {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null)

  const domainScores = useMemo(
    () => summary.scores.filter((s) => s.key !== "overall"),
    [summary.scores]
  )

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center font-title text-2xl text-foreground">
          Domain Scores
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {domainScores.map((score, i) => {
            const normalized = normalizeScore(score.value)
            const color = domainColorHex(score.key)
            const circumference = svgCircumference(24)
            const isTension = score.key === "tension"
            const drivers = summary.drivers_by_domain?.[score.key] ?? []
            const isHovered = hoveredDomain === score.key

            return (
              <motion.div
                key={score.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative flex cursor-default flex-col items-center border border-star-dust-700 bg-card p-4"
                onMouseEnter={() => setHoveredDomain(score.key)}
                onMouseLeave={() => setHoveredDomain(null)}
                role="group"
                aria-label={`${domainLabel(score.key)}: ${Math.round(score.value)}`}
              >
                <div className="relative mb-3 h-16 w-16">
                  <svg
                    viewBox="0 0 60 60"
                    className="h-full w-full -rotate-90"
                    aria-hidden="true"
                  >
                    <circle
                      cx="30"
                      cy="30"
                      r="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-star-dust-700"
                    />
                    <circle
                      cx="30"
                      cy="30"
                      r="24"
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${(normalized / 100) * circumference} ${circumference - (normalized / 100) * circumference}`}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-title text-lg" style={{ color }}>
                      {Math.round(score.value)}
                    </span>
                  </div>
                </div>

                <span className="text-center text-xs leading-tight text-muted-foreground">
                  {domainLabel(score.key)}
                </span>

                {isTension && (
                  <span className="mt-1 text-[10px] text-muted-foreground">
                    (higher = more)
                  </span>
                )}

                {isHovered && drivers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-1/2 z-20 mt-2 min-w-45 -translate-x-1/2 border border-star-dust-700 bg-card p-3 shadow-xl"
                  >
                    <span className="mb-2 block text-[10px] tracking-wider text-muted-foreground uppercase">
                      Top Drivers
                    </span>
                    {drivers.slice(0, 3).map((d: SynastryDriverItem) => (
                      <div
                        key={d.key}
                        className="flex justify-between py-0.5 text-xs text-muted-foreground"
                      >
                        <span className="mr-2 truncate">{d.label}</span>
                        <span className="shrink-0 text-star-dust-500">
                          {d.contribution > 0 ? "+" : ""}
                          {d.contribution.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
