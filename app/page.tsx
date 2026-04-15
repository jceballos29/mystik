import Link from "next/link"

import { Header } from "@/components/header"
import { Section } from "@/components/section"
import { SectionTitle } from "@/components/section-title"
import { Typography } from "@/components/ui/typography"
import { ZodiacSignCard } from "@/components/zodiac-sign-card"
import { BirthDetailsForm } from "@/components/birth-details-form"
import { SynastryFormSection } from "@/components/synastry/synastry-form-section"
import { zodiacSigns } from "@/lib/zodiac-signs"

export default function Page() {
  return (
    <main className="min-h-svh">
      <Header />
      <Section
        id="hero"
        className="bg-background bg-[url('/hero.jpg')] bg-cover bg-center"
      >
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-background/50 to-background"></div>
        <div className="z-10 mx-auto max-w-7xl py-32 sm:py-48 lg:p-56">
          <div className="text-center">
            <Typography.H1 className="text-4xl lg:text-6xl">
              Discover what the stars have in store for you
            </Typography.H1>
            <Typography.P className="mx-auto mt-10 max-w-2xl leading-relaxed font-medium text-muted-foreground">
              Navigate the cosmos of your own existence. We interpret the
              celestial language to bring you clarity, purpose, and connection
              with the universe.
            </Typography.P>
          </div>
        </div>
      </Section>
      <Section id="horoscope">
        <div className="z-10 mx-auto max-w-5xl py-16">
          <SectionTitle
            subtitle="Choose your zodiac sign"
            description="What's your sign? Discover your horoscope for today"
          />
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {zodiacSigns.map((sign) => (
              <Link
                href={`/horoscope/${sign.id}`}
                key={sign.id}
                className="w-full"
              >
                <ZodiacSignCard sign={sign} />
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Personalized Reading ─────────────────────────────────── */}
      <Section id="personalized">
        <div className="z-10 mx-auto max-w-7xl py-16">
          <SectionTitle
            subtitle="Your Personal Cosmic Blueprint"
            description="Enter your birth details for a reading based on your unique natal chart and today's planetary transits"
          />
          <div className="mx-auto max-w-xl border border-star-dust-700 p-8 sm:p-12">
            <BirthDetailsForm />
          </div>
        </div>
      </Section>

      {/* ── Synastry ─────────────────────────────────────────────── */}
      <Section id="synastry">
        <div className="z-10 mx-auto max-w-5xl py-16">
          <SectionTitle
            subtitle="Cosmic Compatibility"
            description="Discover the astrological dynamics between you and another person"
          />
          <div className="mx-auto max-w-2xl border border-star-dust-700 p-8 sm:p-12">
            <SynastryFormSection />
          </div>
        </div>
      </Section>
    </main>
  )
}
