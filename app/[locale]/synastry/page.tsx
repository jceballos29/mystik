/**
 * @module app/[locale]/synastry/page
 *
 * Página del reporte de sinastría localizada. Decodifica el payload Base64URL,
 * valida con Zod, invoca calculateSynastry() y renderiza el reporte.
 */
import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Section } from "@/components/section"
import { AspectExplorer } from "@/components/synastry/aspect-explorer"
import { DomainScores } from "@/components/synastry/domain-scores"
import { StrengthsChallenges } from "@/components/synastry/strengths-challenges"
import { SummaryHeader } from "@/components/synastry/summary-header"
import { Typography } from "@/components/ui/typography"
import { calculateSynastry } from "@/lib/astro-api/synastry"
import { decodeBase64Url } from "@/lib/utils"
import {
  synastryApiPayloadSchema,
  type SynastryApiPayload,
} from "@/lib/validations/synastry.schema"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "synastry_page" })
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  }
}

interface SynastryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  params: Promise<{ locale: string }>
}

function decodePayload(
  q: string | string[] | undefined
): SynastryApiPayload | null {
  if (!q || typeof q !== "string") return null
  if (q.length > 2048) return null

  try {
    const parsed = decodeBase64Url(q)
    const result = synastryApiPayloadSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex min-h-svh flex-col items-center justify-center px-6 text-center"
    >
      <Typography.H2 className="mb-4">Something went wrong</Typography.H2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">{message}</p>
      <Link
        href="/#synastry"
        className="border border-star-dust-700 px-6 py-3 text-sm text-foreground transition-colors hover:border-koromiko-500/50"
      >
        ← Try again
      </Link>
    </div>
  )
}

export default async function SynastryPage({
  searchParams,
}: SynastryPageProps) {
  const { q } = await searchParams

  const payload = decodePayload(q)

  if (!payload) {
    return (
      <ErrorState message="The report link is invalid or expired. Please fill out the form again." />
    )
  }

  const result = await calculateSynastry(payload)

  if (!result.data) {
    return (
      <ErrorState
        message={result.error ?? "Could not load the synastry report."}
      />
    )
  }

  const { data } = result

  const personAName = payload.person_a.name || "Person A"
  const personBName = payload.person_b.name || "Person B"

  return (
    <main className="min-h-svh">
      <Section
        id="synastry-hero"
        className="bg-background bg-[url('/hero.jpg')] bg-cover bg-center"
      >
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-background/50 to-background" />
        <div className="z-10 mx-auto max-w-3xl py-32 text-center">
          <Typography.H1 className="mb-4 text-4xl lg:text-5xl">
            Synastry Report
          </Typography.H1>
          <p className="font-medium text-muted-foreground">
            {personAName} &amp; {personBName}
          </p>
        </div>
      </Section>

      <Section id="synastry-report" className="px-0">
        <div className="z-10 mx-auto max-w-4xl">
          <SummaryHeader summary={data.summary} payload={payload} />
          <div className="h-px bg-star-dust-800" />
          <DomainScores summary={data.summary} />
          <div className="h-px bg-star-dust-800" />
          <StrengthsChallenges summary={data.summary} aspects={data.aspects} />
          <div className="h-px bg-star-dust-800" />
          <AspectExplorer aspects={data.aspects} />
        </div>
      </Section>
    </main>
  )
}
