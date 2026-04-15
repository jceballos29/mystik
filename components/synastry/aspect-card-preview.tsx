"use client"

import { motion } from "framer-motion"

import {
  getPolarityLean,
  strengthLabel,
  domainClasses,
} from "@/components/synastry/synastry-utils"
import type { SynastryAspect } from "@/lib/validations/synastry.schema"

interface AspectCardPreviewProps {
  aspect: SynastryAspect
  onClick: () => void
}

export function AspectCardPreview({ aspect, onClick }: AspectCardPreviewProps) {
  const lean = getPolarityLean(aspect.polarity_score)
  const leanClasses =
    lean === "supportive"
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : lean === "challenging"
        ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
        : "text-koromiko-400 bg-koromiko-500/10 border-koromiko-500/20"

  const defaultBlock =
    aspect.default_block === "supportive"
      ? aspect.blocks.supportive
      : aspect.blocks.challenging

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group w-full cursor-pointer border border-star-dust-700 bg-card p-5 text-left transition-colors duration-200 hover:border-koromiko-500/30"
      aria-label={`View details for ${aspect.label}`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <h3 className="text-base leading-snug font-medium text-foreground transition-colors duration-200 group-hover:text-koromiko-400">
            {defaultBlock.title}
          </h3>
          <p className="mt-1 text-[10px] tracking-widest text-muted-foreground uppercase">
            {aspect.label}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] ${leanClasses}`}
        >
          {lean}
        </span>
      </div>

      <div className="mb-3">
        <span className="text-xs text-muted-foreground">
          {strengthLabel(aspect.strength)}
        </span>
      </div>

      <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-star-dust-400 italic">
        &ldquo;{defaultBlock.one_liner}&rdquo;
      </p>

      <div className="flex flex-wrap gap-1.5">
        {aspect.domains.map((d) => (
          <span
            key={d}
            className={`rounded-sm border px-2 py-0.5 text-[10px] capitalize ${domainClasses(d)}`}
          >
            {d}
          </span>
        ))}
      </div>

      {aspect.display_policy === "both_sides" && (
        <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="5"
              cy="5"
              r="4"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            <line
              x1="5"
              y1="1"
              x2="5"
              y2="9"
              stroke="currentColor"
              strokeWidth="0.6"
            />
          </svg>
          Both sides
        </div>
      )}
    </motion.button>
  )
}
