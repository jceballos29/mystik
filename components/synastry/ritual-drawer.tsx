"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog as DialogPrimitive } from "radix-ui"
import { XIcon } from "lucide-react"

import { IntensityBars } from "@/components/synastry/intensity-bars"
import {
  getPolarityLean,
  strengthLabel,
  domainClasses,
} from "@/components/synastry/synastry-utils"
import type {
  SynastryAspect,
  SynastryBlock,
} from "@/lib/validations/synastry.schema"

interface RitualDrawerProps {
  aspect: SynastryAspect | null
  onClose: () => void
}

export function RitualDrawer({ aspect, onClose }: RitualDrawerProps) {
  const [activeBlock, setActiveBlock] = useState<"supportive" | "challenging">(
    "supportive"
  )
  const [prevAspectKey, setPrevAspectKey] = useState<string | undefined>(
    undefined
  )

  if (aspect?.key !== prevAspectKey) {
    setPrevAspectKey(aspect?.key)
    if (aspect) {
      setActiveBlock(
        aspect.default_block === "challenging" ? "challenging" : "supportive"
      )
    }
  }

  const lean = aspect ? getPolarityLean(aspect.polarity_score) : "balanced"

  return (
    <DialogPrimitive.Root
      open={!!aspect}
      onOpenChange={(open) => !open && onClose()}
    >
      <AnimatePresence>
        {aspect && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild>
              <motion.div
                className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto border-l border-star-dust-700 bg-card shadow-2xl focus:outline-none"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <div className="p-6 sm:p-8">
                  <div className="mb-6 flex justify-end">
                    <DialogPrimitive.Close className="p-1 text-muted-foreground transition-colors hover:text-foreground">
                      <XIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                  </div>

                  <DialogPrimitive.Title className="sr-only">
                    Aspect Detail: {aspect.label}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="sr-only">
                    Detailed view of the {aspect.label} aspect showing
                    supportive and challenging perspectives.
                  </DialogPrimitive.Description>

                  <div className="mb-8">
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      #{aspect.rank} · {strengthLabel(aspect.strength)}
                    </span>
                    <h2 className="mt-1 mb-2 font-title text-3xl text-foreground">
                      {aspect.label}
                    </h2>

                    <div className="mb-4 flex items-center gap-3">
                      <LeanBadge lean={lean} />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                          Intensity
                        </span>
                        <IntensityBars score={aspect.polarity_score} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {aspect.domains.map((d) => (
                        <span
                          key={d}
                          className={`rounded-sm border px-2 py-0.5 text-[10px] capitalize ${domainClasses(d)}`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {aspect.display_policy === "both_sides" && (
                    <div className="mb-8 flex border border-star-dust-700 bg-background/50 p-1">
                      <PolarityToggleButton
                        label="Supportive"
                        active={activeBlock === "supportive"}
                        onClick={() => setActiveBlock("supportive")}
                        variant="supportive"
                      />
                      <PolarityToggleButton
                        label="Challenging"
                        active={activeBlock === "challenging"}
                        onClick={() => setActiveBlock("challenging")}
                        variant="challenging"
                      />
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeBlock}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <BlockContent
                        block={aspect.blocks[activeBlock]}
                        variant={activeBlock}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {aspect.display_policy !== "both_sides" && (
                    <div className="mt-8 border-t border-star-dust-700 pt-8">
                      <p className="mb-4 text-xs tracking-wider text-muted-foreground uppercase">
                        {activeBlock === "supportive"
                          ? "Challenging"
                          : "Supportive"}{" "}
                        perspective
                      </p>
                      <BlockContent
                        block={
                          aspect.blocks[
                            activeBlock === "supportive"
                              ? "challenging"
                              : "supportive"
                          ]
                        }
                        variant={
                          activeBlock === "supportive"
                            ? "challenging"
                            : "supportive"
                        }
                        muted
                      />
                    </div>
                  )}

                  <div className="mt-10 border-t border-star-dust-700 pt-6">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="text-star-dust-400">
                        Interpretation note:
                      </span>{" "}
                      This aspect leans{" "}
                      <span
                        className={
                          lean === "supportive"
                            ? "text-emerald-400/70"
                            : lean === "challenging"
                              ? "text-rose-400/70"
                              : "text-koromiko-400/70"
                        }
                      >
                        {lean}
                      </span>{" "}
                      with a polarity score of{" "}
                      {aspect.polarity_score > 0 ? "+" : ""}
                      {aspect.polarity_score.toFixed(2)}. Scores closer to zero
                      indicate a more balanced dynamic.
                    </p>
                  </div>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}

function LeanBadge({
  lean,
}: {
  lean: "supportive" | "challenging" | "balanced"
}) {
  const cls =
    lean === "supportive"
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      : lean === "challenging"
        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
        : "bg-star-dust-800/50 border-star-dust-600 text-star-dust-400"

  return (
    <span className={`rounded-sm border px-2 py-0.5 text-xs ${cls}`}>
      {lean}
    </span>
  )
}

function BlockContent({
  block,
  variant,
  muted = false,
}: {
  block: SynastryBlock
  variant: "supportive" | "challenging"
  muted?: boolean
}) {
  const accent = variant === "supportive" ? "text-emerald-400" : "text-rose-400"
  const dotColor = variant === "supportive" ? "bg-emerald-400" : "bg-rose-400"

  return (
    <div className={muted ? "opacity-40" : ""}>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
          aria-hidden="true"
        />
        <h3 className={`font-title text-lg ${accent}`}>{block.title}</h3>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground italic">
        &ldquo;{block.one_liner}&rdquo;
      </p>

      <p className="text-sm leading-relaxed text-star-dust-400">
        {block.insight}
      </p>
    </div>
  )
}

function PolarityToggleButton({
  label,
  active,
  onClick,
  variant,
}: {
  label: string
  active: boolean
  onClick: () => void
  variant: "supportive" | "challenging"
}) {
  const activeStyles =
    variant === "supportive"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
      : "bg-rose-500/15 text-rose-400 border-rose-500/25"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-sm border px-4 py-2 text-xs transition-all duration-200 ${
        active
          ? activeStyles
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}
