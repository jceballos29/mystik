/**
 * @module components/locale-switcher
 *
 * Botón para alternar entre locales (en/es). Deriva el locale actual
 * desde `useParams()` para evitar dependencia del contexto de next-intl
 * (permite renderizado incluso fuera de NextIntlClientProvider).
 */
"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import type { Locale } from "@/i18n/routing"

export function LocaleSwitcher() {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const currentLocale = (params?.locale as Locale) ?? "en"
  const nextLocale: Locale = currentLocale === "en" ? "es" : "en"

  const handleSwitch = () => {
    startTransition(() => {
      // Reemplaza el segmento de locale en la URL actual
      const segments = pathname.split("/")
      if (segments[1] === currentLocale) {
        segments[1] = nextLocale
      } else {
        segments.splice(1, 0, nextLocale)
      }
      router.push(segments.join("/") || `/${nextLocale}`)
    })
  }

  return (
    <button
      type="button"
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={`Switch to ${nextLocale === "en" ? "English" : "Español"}`}
      className="border border-star-dust-700 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-star-dust-400 uppercase transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-40"
    >
      {nextLocale.toUpperCase()}
    </button>
  )
}
