/**
 * @module app/[locale]/synastry/error
 *
 * Error boundary localizado para la ruta de sinastría.
 */
"use client"

import { useTranslations } from "next-intl"
import { useEffect } from "react"
import Link from "next/link"

export default function SynastryError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("synastry_page")

  useEffect(() => {
    console.error("[SynastryError]", error)
  }, [error])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-[10px] font-bold tracking-[0.4em] text-primary uppercase">
        Report Unavailable
      </p>
      <p className="mb-8 max-w-md font-sans text-base text-star-dust-300">
        We couldn&apos;t load the synastry report. Please try again.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="border border-star-dust-700 px-6 py-3 text-sm transition-colors hover:border-koromiko-500/50"
        >
          Retry
        </button>
        <Link
          href="/#synastry"
          className="border border-star-dust-700 px-6 py-3 text-sm transition-colors hover:border-koromiko-500/50"
        >
          {t("back")}
        </Link>
      </div>
    </main>
  )
}
