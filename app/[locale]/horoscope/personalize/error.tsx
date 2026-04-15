/**
 * @module app/[locale]/horoscope/personalize/error
 *
 * Error boundary localizado para horóscopo personalizado.
 */
"use client"

import { useTranslations } from "next-intl"
import { useEffect } from "react"
import Link from "next/link"

export default function PersonalizeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("horoscope")

  useEffect(() => {
    console.error("[PersonalizeError]", error)
  }, [error])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-[10px] font-bold tracking-[0.4em] text-primary uppercase">
        {t("reading_unavailable")}
      </p>
      <p className="mb-8 max-w-md font-sans text-base text-star-dust-300">
        We couldn&apos;t load your personalized horoscope. Please try again.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="border border-star-dust-700 px-6 py-3 text-sm transition-colors hover:border-koromiko-500/50"
        >
          Retry
        </button>
        <Link
          href="/"
          className="border border-star-dust-700 px-6 py-3 text-sm transition-colors hover:border-koromiko-500/50"
        >
          ← {t("back")}
        </Link>
      </div>
    </main>
  )
}
