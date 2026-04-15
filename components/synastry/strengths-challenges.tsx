/**
 * @module components/synastry/strengths-challenges
 *
 * Vista de dos columnas que separa los aspectos de la sinastría en
 * fortalezas (supportive) y desafíos (challenging). Usa `mapKeyToAspect`
 * para resolver las keys del resumen a aspectos completos. Al hacer click
 * en un aspecto, abre el `RitualDrawer` con el detalle.
 */
"use client"

import { useMemo, useState } from "react"

import { AspectCardPreview } from "@/components/synastry/aspect-card-preview"
import { RitualDrawer } from "@/components/synastry/ritual-drawer"
import { mapKeyToAspect } from "@/components/synastry/synastry-utils"
import type {
  SynastrySummary,
  SynastryAspect,
} from "@/lib/validations/synastry.schema"

interface StrengthsChallengesProps {
  summary: SynastrySummary
  aspects: SynastryAspect[]
}

export function StrengthsChallenges({
  summary,
  aspects,
}: StrengthsChallengesProps) {
  const [selectedAspect, setSelectedAspect] = useState<SynastryAspect | null>(
    null
  )

  const strengths = useMemo(
    () =>
      summary.strengths
        .map((key) => mapKeyToAspect(key, aspects))
        .filter((a): a is SynastryAspect => a !== undefined),
    [summary.strengths, aspects]
  )

  const challenges = useMemo(
    () =>
      summary.challenges
        .map((key) => mapKeyToAspect(key, aspects))
        .filter((a): a is SynastryAspect => a !== undefined),
    [summary.challenges, aspects]
  )

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <div className="mb-6 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
              <h2 className="font-title text-xl text-foreground">Strengths</h2>
            </div>
            <div className="space-y-3">
              {strengths.map((aspect) => (
                <AspectCardPreview
                  key={aspect.key}
                  aspect={aspect}
                  onClick={() => setSelectedAspect(aspect)}
                />
              ))}
              {strengths.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No strengths identified.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full bg-rose-400"
                aria-hidden="true"
              />
              <h2 className="font-title text-xl text-foreground">Challenges</h2>
            </div>
            <div className="space-y-3">
              {challenges.map((aspect) => (
                <AspectCardPreview
                  key={aspect.key}
                  aspect={aspect}
                  onClick={() => setSelectedAspect(aspect)}
                />
              ))}
              {challenges.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No challenges identified.
                </p>
              )}
            </div>
          </div>
        </div>

        <RitualDrawer
          aspect={selectedAspect}
          onClose={() => setSelectedAspect(null)}
        />
      </div>
    </section>
  )
}
