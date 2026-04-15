"use client"

import { useState, useMemo } from "react"
import { AnimatePresence } from "framer-motion"

import { AspectCardPreview } from "@/components/synastry/aspect-card-preview"
import { RitualDrawer } from "@/components/synastry/ritual-drawer"
import {
  getPolarityLean,
  domainColorHex,
} from "@/components/synastry/synastry-utils"
import {
  DOMAINS,
  type SynastryAspect,
  type SynastryDomain,
} from "@/lib/validations/synastry.schema"

interface AspectExplorerProps {
  aspects: SynastryAspect[]
}

type SortKey = "rank" | "abs_polarity"

export function AspectExplorer({ aspects }: AspectExplorerProps) {
  const [filterDomain, setFilterDomain] = useState<SynastryDomain | "all">(
    "all"
  )
  const [sortBy, setSortBy] = useState<SortKey>("rank")
  const [selectedAspect, setSelectedAspect] = useState<SynastryAspect | null>(
    null
  )
  const [isExpanded, setIsExpanded] = useState(false)

  const filtered = useMemo(() => {
    let list = [...aspects]

    if (filterDomain !== "all") {
      list = list.filter((a) => a.domains.includes(filterDomain))
    }

    if (sortBy === "rank") {
      list.sort((a, b) => a.rank - b.rank)
    } else {
      list.sort((a, b) => b.abs_polarity - a.abs_polarity)
    }

    return list
  }, [aspects, filterDomain, sortBy])

  const displayed = useMemo(() => {
    if (isExpanded) return filtered
    if (filtered.length <= 6) return filtered

    const supportive = filtered
      .filter((a) => getPolarityLean(a.polarity_score) === "supportive")
      .slice(0, 3)
    const challenging = filtered
      .filter((a) => getPolarityLean(a.polarity_score) === "challenging")
      .slice(0, 3)

    const combined = [...supportive, ...challenging]

    if (sortBy === "rank") {
      combined.sort((a, b) => a.rank - b.rank)
    } else {
      combined.sort((a, b) => b.abs_polarity - a.abs_polarity)
    }

    return combined
  }, [filtered, isExpanded, sortBy])

  return (
    <section className="px-6 py-16" id="explorer">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-title mb-8 text-center text-2xl text-foreground">
          Aspect Explorer
        </h2>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex flex-wrap gap-2">
            <Chip
              label="All"
              active={filterDomain === "all"}
              onClick={() => setFilterDomain("all")}
            />
            {DOMAINS.map((d) => (
              <Chip
                key={d}
                label={d}
                active={filterDomain === d}
                onClick={() => setFilterDomain(d)}
                color={domainColorHex(d)}
              />
            ))}
          </div>

          <div className="hidden h-5 w-px bg-star-dust-700 sm:block" />

          <div className="flex gap-2">
            <Chip
              label="By Rank"
              active={sortBy === "rank"}
              onClick={() => setSortBy("rank")}
            />
            <Chip
              label="By Intensity"
              active={sortBy === "abs_polarity"}
              onClick={() => setSortBy("abs_polarity")}
            />
          </div>
        </div>

        <p className="mb-6 text-center text-xs text-muted-foreground">
          Showing {displayed.length} of {filtered.length} aspect
          {filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {displayed.map((aspect) => (
              <AspectCardPreview
                key={aspect.key}
                aspect={aspect}
                onClick={() => setSelectedAspect(aspect)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length > 6 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="border border-star-dust-700 bg-card px-6 py-2.5 text-xs tracking-widest text-foreground uppercase transition-all hover:border-koromiko-500/30"
            >
              {isExpanded ? "Show Less" : `View All ${filtered.length} Aspects`}
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground italic">
            No aspects match this filter.
          </p>
        )}

        <RitualDrawer
          aspect={selectedAspect}
          onClose={() => setSelectedAspect(null)}
        />
      </div>
    </section>
  )
}

function Chip({
  label,
  active,
  onClick,
  color,
}: {
  label: string
  active: boolean
  onClick: () => void
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 text-xs capitalize transition-all duration-200 ${
        active
          ? "border-koromiko-500/40 bg-koromiko-500/10 text-koromiko-400"
          : "border-star-dust-700 text-muted-foreground hover:border-star-dust-500 hover:text-foreground"
      }`}
      style={
        active && color
          ? { borderColor: `${color}60`, color, backgroundColor: `${color}15` }
          : undefined
      }
    >
      {label}
    </button>
  )
}
