import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Section } from "@/components/section"
import { Typography } from "@/components/ui/typography"
import { zodiacSigns } from "@/lib/zodiac-signs"
import { getDailyHoroscope } from "@/lib/astro-api/horoscope"
import {
  formatLuckyTimeWindow,
  getFactorReason,
  getScoreLabel,
} from "@/lib/horoscope-utils"
import { ScoreBar } from "@/components/horoscope/score-bar"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

function ErrorState({ message }: { message: string }) {
  return (
    <div className="border border-star-dust-600 p-8 text-center">
      <p className="mb-4 text-[10px] font-bold tracking-[0.4em] text-primary uppercase">
        Reading Unavailable
      </p>
      <p className="font-sans text-base leading-relaxed font-medium text-star-dust-300">
        {message}
      </p>
    </div>
  )
}

// ── Static params ──────────────────────────────────────────────────────

export function generateStaticParams() {
  return zodiacSigns.map((sign) => ({ sign: sign.id }))
}

// ── Metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>
}): Promise<Metadata> {
  const { sign } = await params
  const zodiacSign = zodiacSigns.find((z) => z.id === sign)
  if (!zodiacSign) return {}
  return {
    title: `${zodiacSign.name} Horoscope Today — Mystik`,
    description: `Daily horoscope for ${zodiacSign.name}. Love, career, money, and health forecast.`,
  }
}

// ── Page ─────────────────────────────────────────────────────────────

export default async function ZodiacSignPage({
  params,
}: {
  params: Promise<{ sign: string }>
}) {
  const { sign } = await params

  const zodiacSign = zodiacSigns.find((z) => z.id === sign)

  if (!zodiacSign) notFound()

  const { start, end } = zodiacSign.date
  const dateLabel = `${start.month} ${start.day} – ${end.month} ${end.day}`

  const signIndex = zodiacSigns.findIndex((z) => z.id === sign)
  const nextSign = zodiacSigns[(signIndex + 1) % zodiacSigns.length]

  const result = await getDailyHoroscope(sign)
  const horoscope = result.error ? null : result.data
  const meta = result.error ? null : result.meta

  return (
    <main className="min-h-svh">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Section
        id="sign-hero"
        className="bg-background bg-[url('/horoscope-daily-hero.jpg')] bg-cover bg-center"
      >
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-background/50 to-background" />
        <div className="z-10 mx-auto max-w-7xl py-32 sm:py-48 lg:p-56">
          <div className="text-center">
            <Typography.H1>{zodiacSign.name}</Typography.H1>
            {horoscope && meta && (
              <span className="text-sm tracking-widest text-star-dust-500 uppercase">
                {meta.settings.date_resolved}
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* ── Content ──────────────────────────────────────────────── */}
      <Section id="horoscope">
        <div className="z-10 mx-auto max-w-3xl py-16">
          {/* Navigation */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase transition-colors hover:text-star-dust-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <Link
              href={`/horoscope/${nextSign.id}`}
              className="text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase transition-colors hover:text-star-dust-300"
            >
              {nextSign.name} →
            </Link>
          </div>

          {/* Sign header */}
          <div className="mb-8 flex items-center gap-3">
            <figure className="aspect-square w-10 overflow-hidden">
              <Image
                src={zodiacSign.image}
                alt={zodiacSign.name}
                width={100}
                height={100}
                className="h-full w-full object-contain"
              />
            </figure>
            <h2 className="font-title text-3xl font-extralight tracking-tighter text-koromiko-300 capitalize">
              {zodiacSign.name}
            </h2>
            <span className="ml-1 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
              {dateLabel}
            </span>
            {horoscope && (
              <span className="ml-auto border border-star-dust-700 px-4 py-1 text-[10px] font-bold tracking-[0.4em] text-koromiko-500/80 uppercase">
                {horoscope.content.theme}
              </span>
            )}
          </div>

          {/* Error state */}
          {result.error && <ErrorState message={result.error} />}

          {/* ── Horoscope data ──────────────────────────────────── */}
          {horoscope && meta && (
            <>
              {/* ── 1. Main Reading ─────────────────────────────── */}
              <div className="mx-auto mb-16 max-w-3xl text-center">
                {/* Theme + Keywords badges */}
                <div className="mb-8 flex flex-wrap justify-center gap-3">
                  <span className="border border-star-dust-700 px-3 py-1.5 text-[10px] font-bold tracking-[0.4em] text-koromiko-500/80 uppercase">
                    {horoscope.content.theme}
                  </span>
                  {[...new Set(horoscope.content.keywords)].map((keyword) => (
                    <span
                      key={keyword}
                      className="border border-star-dust-700 px-3 py-1.5 text-[10px] font-bold tracking-[0.4em] text-primary uppercase"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                {/* Main reading with drop cap */}
                <p className="text-2xl leading-relaxed font-light text-star-dust-200 md:text-3xl">
                  <span className="float-left mt-1 mr-4 border-r border-star-dust-800 pr-4 text-[4.5rem] leading-[0.85] font-light text-star-dust-600 select-none md:text-[5.5rem]">
                    {horoscope.content.text.charAt(0)}
                  </span>
                  {horoscope.content.text.slice(1)}
                </p>

                {/* Supporting insights */}
                {horoscope.content.supporting_insights &&
                  horoscope.content.supporting_insights.length > 0 && (
                    <div className="mt-8 space-y-2">
                      {horoscope.content.supporting_insights.map((insight) => (
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

              {/* ── 2. Data Grid (Scores + Cosmic Context) ─────── */}
              <div className="mb-8 grid grid-cols-1 gap-px border border-star-dust-600 md:grid-cols-2">
                {/* Scores (left) */}
                <div className="space-y-8 p-8 md:p-10">
                  <h3 className="mb-6 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                    Energy Forecast
                  </h3>

                  <div className="space-y-6">
                    {/* Overall score */}
                    {horoscope.scores.overall !== undefined && (
                      <div className="space-y-2 border-b border-star-dust-800 pb-6">
                        <div className="flex items-center gap-4">
                          <div className="flex w-16 items-center gap-3">
                            <span className="text-[10px] font-bold tracking-[0.4em] text-star-dust-400 uppercase">
                              Overall
                            </span>
                          </div>
                          <div className="h-px flex-1 overflow-hidden bg-star-dust-800">
                            <div
                              className="h-full bg-koromiko-400"
                              style={{
                                width: `${horoscope.scores.overall}%`,
                              }}
                            />
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="w-8 text-right text-sm font-bold text-koromiko-400">
                              {horoscope.scores.overall}
                            </span>
                            <span className="text-[10px] tracking-[0.2em] text-star-dust-500 uppercase italic">
                              {getScoreLabel(horoscope.scores.overall)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dimension scores */}
                    {(["love", "career", "money", "health"] as const).map(
                      (dim) => (
                        <ScoreBar
                          key={dim}
                          label={dim}
                          value={horoscope.scores[dim]}
                          reason={getFactorReason(horoscope.score_factors, dim)}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Cosmic Context (right) */}
                <div className="space-y-10 border-t border-star-dust-600 p-8 md:border-t-0 md:border-l md:p-10">
                  <div>
                    <h3 className="mb-6 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                      Cosmic Context
                    </h3>
                    <div className="mb-6 grid grid-cols-2 gap-6">
                      <div>
                        <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                          Moon Phase
                        </p>
                        <p className="font-title text-lg text-koromiko-300">
                          {horoscope.astro.moon_phase.label}
                        </p>
                      </div>
                      <div>
                        <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                          Moon Sign
                        </p>
                        <p className="font-title text-lg text-koromiko-300">
                          {horoscope.astro.moon_sign.label}
                        </p>
                      </div>
                    </div>

                    {/* Planetary Aspects */}
                    {horoscope.astro.highlights.filter(
                      (h) => h.type === "sky_aspect"
                    ).length > 0 && (
                      <div className="space-y-2 border-t border-star-dust-800 pt-6">
                        <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                          Planetary Aspects
                        </p>
                        {horoscope.astro.highlights
                          .filter((h) => h.type === "sky_aspect")
                          .map((h) => (
                            <p
                              key={h.key}
                              className="text-sm text-star-dust-300"
                            >
                              {h.label}
                            </p>
                          ))}
                      </div>
                    )}

                    {/* Daily Anchors */}
                    <div className="border-t border-star-dust-800 pt-6">
                      <h3 className="mb-6 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                        Daily Anchors
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                            Color
                          </p>
                          <p className="font-title text-lg text-koromiko-300 capitalize">
                            {horoscope.lucky.color.label}
                          </p>
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                            Number
                          </p>
                          <p className="font-title text-lg text-koromiko-300">
                            {horoscope.lucky.number}
                          </p>
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] font-bold tracking-[0.3em] text-star-dust-500 uppercase">
                            Time
                          </p>
                          <p className="font-title text-lg text-koromiko-300">
                            {formatLuckyTimeWindow(horoscope.lucky.time_window)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 4. Guidance (Do / Don't) ────────────────────── */}
              {(horoscope.content.do && horoscope.content.do.length > 0) ||
              (horoscope.content.dont && horoscope.content.dont.length > 0) ? (
                <div className="grid grid-cols-1 gap-px border border-star-dust-600 md:grid-cols-2">
                  {horoscope.content.do && horoscope.content.do.length > 0 ? (
                    <div className="p-8 md:p-10">
                      <h3 className="mb-6 text-[10px] font-bold tracking-[0.4em] text-primary uppercase">
                        Do
                      </h3>
                      <ul className="space-y-3">
                        {horoscope.content.do.map((item) => (
                          <li
                            key={item}
                            className="flex items-baseline gap-4 text-sm leading-relaxed text-star-dust-300"
                          >
                            <span className="text-xs text-star-dust-600">
                              +
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {horoscope.content.dont &&
                  horoscope.content.dont.length > 0 ? (
                    <div className="border-t border-star-dust-600 p-8 md:border-t-0 md:border-l md:p-10">
                      <h3 className="mb-6 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase">
                        Don&apos;t
                      </h3>
                      <ul className="space-y-3">
                        {horoscope.content.dont.map((item) => (
                          <li
                            key={item}
                            className="flex items-baseline gap-4 text-sm leading-relaxed text-star-dust-300"
                          >
                            <span className="text-xs text-star-dust-600">
                              −
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      </Section>
    </main>
  )
}
