/**
 * @module app/[locale]/horoscope/personalize/page
 *
 * Página de lectura personalizada localizada. Client Component que decodifica
 * datos de nacimiento del query string, llama a getPersonalizedHoroscope()
 * y renderiza el resultado con soporte i18n via useTranslations.
 */
"use client"

import { ScoreBar } from "@/components/horoscope/score-bar"
import { Section } from "@/components/section"
import { getPersonalizedHoroscope } from "@/lib/astro-api/horoscope"
import {
  formatLuckyTimeWindow,
  getFactorReason,
  getScoreLabel,
} from "@/lib/horoscope-utils"
import { decodeBase64Url } from "@/lib/utils"
import type {
  HoroscopeData,
  HoroscopeTransit,
} from "@/lib/validations/horoscope.schema"
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"

const TRANSIT_STAGGER_MS = 80

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-star-dust-800/60 ${className ?? ""}`} />
  )
}

function LoadingSkeleton() {
  return (
    <div className="z-10 mx-auto max-w-3xl space-y-12 py-16">
      <SkeletonBlock className="h-4 w-32 rounded" />
      <div className="space-y-4 py-16 text-center">
        <SkeletonBlock className="mx-auto h-12 w-48 rounded" />
        <SkeletonBlock className="mx-auto h-4 w-32 rounded" />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {[1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-6 w-24 rounded" />
        ))}
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-full rounded" />
        <SkeletonBlock className="h-8 w-full rounded" />
        <SkeletonBlock className="h-8 w-4/5 rounded" />
      </div>
      <div className="space-y-6 pt-8">
        <SkeletonBlock className="h-3 w-36 rounded" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="space-y-2 border-l-2 border-star-dust-800 pl-6"
          >
            <SkeletonBlock className="h-3 w-64 rounded" />
            <SkeletonBlock className="h-6 w-full rounded" />
            <SkeletonBlock className="h-6 w-5/6 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-6 border border-star-dust-800 p-8">
        <SkeletonBlock className="h-3 w-32 rounded" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonBlock className="h-3 w-16 rounded" />
            <SkeletonBlock className="h-px flex-1 rounded" />
            <SkeletonBlock className="h-4 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function TransitCard({
  transit,
  index,
}: {
  transit: HoroscopeTransit
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const {
    transit_planet,
    natal_planet,
    aspect,
    explanation,
    orb_deg,
    is_applying,
    score,
  } = transit
  const mainText =
    typeof explanation === "string" ? explanation : explanation.main
  const supporting =
    typeof explanation === "object" ? (explanation.supporting ?? []) : []
  const tags = typeof explanation === "object" ? (explanation.tags ?? []) : []

  return (
    <div
      className="group relative border-l-2 border-star-dust-800 pb-12 pl-8 last:pb-0"
      style={{ animationDelay: `${index * TRANSIT_STAGGER_MS}ms` }}
    >
      <div className="absolute top-1 -left-1.25 h-2.25 w-2.25 rounded-full border border-star-dust-700 bg-background transition-colors group-hover:border-koromiko-500" />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold tracking-[0.2em] text-star-dust-300 uppercase">
            {transit_planet.label}{" "}
            <span className="px-1 tracking-normal text-star-dust-600 normal-case italic">
              {aspect.label}
            </span>{" "}
            {natal_planet.label}
          </span>
          <span className="text-[9px] font-medium tracking-widest text-star-dust-600 uppercase">
            orb {Math.abs(orb_deg).toFixed(1)}°
          </span>
          <span
            className={`text-[9px] font-bold tracking-widest uppercase ${
              is_applying ? "text-koromiko-400" : "text-star-dust-600"
            }`}
          >
            {is_applying ? "Applying" : "Separating"}
          </span>
          {score > 80 && (
            <span className="ml-auto border border-koromiko-500/30 bg-koromiko-500/10 px-2 py-0.5 text-[8px] font-bold tracking-widest text-koromiko-400 uppercase">
              Significant
            </span>
          )}
        </div>
        <p className="text-base leading-relaxed font-light text-star-dust-200 md:text-lg">
          {mainText}
        </p>
        {supporting.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-[9px] tracking-widest text-star-dust-600 uppercase transition-colors hover:text-star-dust-400"
            >
              {expanded ? "Hide guidance" : "Show guidance"}
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            {expanded && (
              <div className="mt-4 space-y-3">
                {supporting.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 text-sm leading-relaxed text-star-dust-400"
                  >
                    <span className="mt-1.5 shrink-0 text-star-dust-700">
                      —
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="border border-star-dust-800 px-2.5 py-1 text-[9px] font-medium tracking-[0.2em] text-star-dust-600 uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  const t = useTranslations("horoscope")
  return (
    <div className="space-y-4 border border-star-dust-600 p-8 text-center">
      <p className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">
        {t("reading_unavailable")}
      </p>
      <p className="text-sm leading-relaxed font-medium text-star-dust-300">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-10 border border-star-dust-600 px-8 text-[10px] font-bold tracking-[0.4em] text-primary uppercase transition-colors hover:border-koromiko-500/50"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

function PersonalizeContent() {
  const t = useTranslations("horoscope")
  const searchParams = useSearchParams()
  const router = useRouter()

  interface BirthParams {
    year?: number
    month?: number
    day?: number
    hour?: number
    min?: number
    lat?: number
    lon?: number
    city?: string
  }

  const bp = useMemo((): BirthParams | null => {
    const q = searchParams.get("q")
    if (!q) return null
    try {
      return decodeBase64Url(q) as BirthParams
    } catch {
      return null
    }
  }, [searchParams])

  const year = bp?.year ?? null
  const month = bp?.month ?? null
  const day = bp?.day ?? null
  const hour = bp?.hour ?? null
  const min = bp?.min ?? null
  const lat = bp?.lat ?? null
  const lon = bp?.lon ?? null
  const city = bp?.city ?? null

  const paramError = useMemo<string | null>(() => {
    if (
      year == null ||
      month == null ||
      day == null ||
      lat == null ||
      lon == null
    )
      return "Missing birth details. Please fill in the form again."
    const numericFields = [year, month, day, lat, lon]
    if (hour != null) numericFields.push(hour)
    if (min != null) numericFields.push(min)
    if (numericFields.map(Number).some(Number.isNaN))
      return "Invalid birth details in the URL. Please fill in the form again."
    return null
  }, [year, month, day, lat, lon, hour, min])

  const [data, setData] = useState<HoroscopeData | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(paramError === null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (paramError) return

    let cancelled = false
    ;(async () => {
      const result = await getPersonalizedHoroscope({
        year: Number(year!),
        month: Number(month!),
        day: Number(day!),
        hour: Number(hour ?? 12),
        minute: Number(min ?? 0),
        latitude: Number(lat!),
        longitude: Number(lon!),
        city: city ?? "Unknown",
      })
      if (cancelled) return
      if (result.error) {
        setApiError(result.error)
      } else {
        setData(result.data ?? null)
      }
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [paramError, retryKey, year, month, day, hour, min, lat, lon, city])

  const handleRetry = () => {
    setLoading(true)
    setApiError(null)
    setRetryKey((k) => k + 1)
  }

  const error = paramError ?? apiError

  const birthDateLabel =
    year && month && day && !paramError
      ? new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null

  return (
    <div className="z-10 mx-auto max-w-3xl py-16">
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase transition-colors hover:text-star-dust-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change Details
        </button>
        <div className="flex flex-wrap items-center gap-3">
          {birthDateLabel && (
            <div className="flex items-center gap-2 border border-star-dust-700 px-3 py-1.5 text-[10px] tracking-widest text-star-dust-500 uppercase">
              <CalendarDays className="h-3 w-3" />
              {birthDateLabel}
            </div>
          )}
          {city && (
            <div className="flex items-center gap-2 border border-star-dust-700 px-3 py-1.5 text-[10px] tracking-widest text-star-dust-500 uppercase">
              <MapPin className="h-3 w-3" />
              {city}
            </div>
          )}
        </div>
      </div>

      {loading && <LoadingSkeleton />}
      {error && !loading && (
        <ErrorState message={error} onRetry={handleRetry} />
      )}

      {data && !loading && !error && (
        <>
          <div className="mb-16 text-center">
            <p className="mb-4 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
              Your Personal Reading
            </p>
            <h1 className="mb-3 font-title text-6xl font-extralight tracking-tighter text-koromiko-300 capitalize md:text-7xl">
              {data.sign}
            </h1>
            <p className="text-[11px] tracking-widest text-star-dust-600 uppercase">
              Today ·{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {data.personal?.focus_areas &&
            data.personal.focus_areas.length > 0 && (
              <div className="mb-12">
                <p className="mb-4 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                  Focus Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.personal.focus_areas.map((area) => (
                    <span
                      key={area}
                      className="border border-koromiko-500/30 bg-koromiko-500/5 px-3 py-1.5 text-[10px] font-medium tracking-[0.15em] text-koromiko-400 uppercase"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

          <div className="mb-16">
            <div className="mb-8 flex flex-wrap gap-3">
              <span className="border border-star-dust-700 px-3 py-1.5 text-[10px] font-bold tracking-[0.4em] text-koromiko-500/80 uppercase">
                {data.content.theme}
              </span>
              {[...new Set(data.content.keywords)].map((kw) => (
                <span
                  key={kw}
                  className="border border-star-dust-700 px-3 py-1.5 text-[10px] font-bold tracking-[0.4em] text-primary uppercase"
                >
                  {kw}
                </span>
              ))}
            </div>
            <p className="text-2xl leading-relaxed font-light text-star-dust-200 md:text-3xl">
              <span className="float-left mt-1 mr-4 border-r border-star-dust-800 pr-4 text-[4.5rem] leading-[0.85] font-light text-star-dust-600 select-none md:text-[5.5rem]">
                {data.content.text.charAt(0)}
              </span>
              {data.content.text.slice(1)}
            </p>
            {data.content.supporting_insights &&
              data.content.supporting_insights.length > 0 && (
                <div className="clear-both mt-8 space-y-2 pt-4">
                  {data.content.supporting_insights.map((insight) => (
                    <p
                      key={insight}
                      className="text-sm text-star-dust-500 italic"
                    >
                      {insight}
                    </p>
                  ))}
                </div>
              )}
          </div>

          {data.personal?.transits_top &&
            data.personal.transits_top.length > 0 && (
              <div className="clear-both mb-16">
                <div className="mb-10 flex items-center gap-6">
                  <h2 className="shrink-0 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                    Transit Deep-Dive
                  </h2>
                  <div className="h-px flex-1 bg-star-dust-800" />
                  <span className="shrink-0 text-[9px] text-star-dust-700 italic">
                    Your natal chart today
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute top-1 left-0 ml-px h-full w-px bg-linear-to-b from-star-dust-700 via-star-dust-800 to-transparent" />
                  <div className="space-y-8">
                    {[...data.personal.transits_top]
                      .sort((a, b) => Math.abs(a.orb_deg) - Math.abs(b.orb_deg))
                      .map((transit, i) => (
                        <TransitCard
                          key={`${transit.transit_planet.label}-${transit.natal_planet.label}-${transit.aspect.label}`}
                          transit={transit}
                          index={i}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}

          <div className="mb-8 grid grid-cols-1 gap-px border border-star-dust-600 md:grid-cols-2">
            <div className="space-y-8 p-8 md:p-10">
              <h3 className="text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                {t("energy_forecast")}
              </h3>
              <div className="space-y-6">
                {data.scores.overall !== undefined && (
                  <div className="space-y-2 border-b border-star-dust-800 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 shrink-0">
                        <span className="text-[10px] font-bold tracking-[0.4em] text-star-dust-400 uppercase">
                          {t("overall")}
                        </span>
                      </div>
                      <div className="h-px flex-1 overflow-hidden bg-star-dust-800">
                        <div
                          className="h-full bg-koromiko-400"
                          style={{ width: `${data.scores.overall}%` }}
                        />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="w-8 text-right text-sm font-bold text-koromiko-400">
                          {data.scores.overall}
                        </span>
                        <span className="text-[10px] tracking-[0.2em] text-star-dust-500 uppercase italic">
                          {getScoreLabel(data.scores.overall)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {(["love", "career", "money", "health"] as const).map((dim) => (
                  <ScoreBar
                    key={dim}
                    label={dim}
                    value={data.scores[dim]}
                    reason={getFactorReason(data.score_factors, dim)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-10 border-t border-star-dust-600 p-8 md:border-t-0 md:border-l md:p-10">
              <div>
                <h3 className="mb-6 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                  {t("cosmic_context")}
                </h3>
                <div className="mb-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                      {t("moon_phase")}
                    </p>
                    <p className="font-title text-lg text-koromiko-300">
                      {data.astro.moon_phase.label}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                      {t("moon_sign")}
                    </p>
                    <p className="font-title text-lg text-koromiko-300">
                      {data.astro.moon_sign.label}
                    </p>
                  </div>
                </div>
                {data.astro.highlights.filter((h) => h.type === "sky_aspect")
                  .length > 0 && (
                  <div className="space-y-2 border-t border-star-dust-800 pt-6">
                    <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                      {t("planetary_aspects")}
                    </p>
                    {data.astro.highlights
                      .filter((h) => h.type === "sky_aspect")
                      .map((h) => (
                        <p key={h.key} className="text-sm text-star-dust-300">
                          {h.label}
                        </p>
                      ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="mb-6 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                  {t("daily_anchors")}
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                      {t("color")}
                    </p>
                    <p className="font-title text-base text-koromiko-300 capitalize">
                      {data.lucky.color.label}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                      {t("number")}
                    </p>
                    <p className="font-title text-base text-koromiko-300">
                      {data.lucky.number}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                      {t("time")}
                    </p>
                    <p className="font-title text-base text-koromiko-300">
                      {formatLuckyTimeWindow(data.lucky.time_window)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {((data.content.do && data.content.do.length > 0) ||
            (data.content.dont && data.content.dont.length > 0)) && (
            <div className="grid grid-cols-1 gap-px border border-star-dust-600 md:grid-cols-2">
              {data.content.do && data.content.do.length > 0 && (
                <div className="p-8 md:p-10">
                  <h3 className="mb-6 text-[10px] font-bold tracking-[0.4em] text-primary uppercase">
                    {t("do")}
                  </h3>
                  <ul className="space-y-3">
                    {data.content.do.map((item) => (
                      <li
                        key={item}
                        className="flex items-baseline gap-4 text-sm leading-relaxed text-star-dust-300"
                      >
                        <span className="text-xs text-star-dust-600">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.content.dont && data.content.dont.length > 0 && (
                <div className="border-t border-star-dust-600 p-8 md:border-t-0 md:border-l md:p-10">
                  <h3 className="mb-6 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                    {t("dont")}
                  </h3>
                  <ul className="space-y-3">
                    {data.content.dont.map((item) => (
                      <li
                        key={item}
                        className="flex items-baseline gap-4 text-sm leading-relaxed text-star-dust-300"
                      >
                        <span className="text-xs text-star-dust-600">−</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function PersonalizePage() {
  return (
    <main className="min-h-svh">
      <Section
        id="personalize-hero"
        className="bg-background bg-[url('/horoscope-daily-hero.jpg')] bg-cover bg-center"
      >
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-background/50 to-background" />
        <div className="z-10 mx-auto max-w-7xl py-32 sm:py-48 lg:p-56">
          <div className="space-y-4 text-center">
            <p className="text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
              Personalized Reading
            </p>
            <h1 className="font-title text-5xl font-bold tracking-wider text-balance text-primary sm:text-6xl lg:text-7xl">
              Your Cosmic Blueprint
            </h1>
            <p className="text-sm tracking-wide text-star-dust-500">
              Transit-based insights for your natal chart · Today only
            </p>
          </div>
        </div>
      </Section>

      <Section id="personalize-reading">
        <Suspense
          fallback={
            <div className="z-10 mx-auto max-w-3xl py-16">
              <LoadingSkeleton />
            </div>
          }
        >
          <PersonalizeContent />
        </Suspense>
      </Section>
    </main>
  )
}
