
import { About } from "@/components/home/about"
import { Hero } from "@/components/home/hero"
import { Horoscope } from "@/components/home/horoscope"
import { Personalized } from "@/components/home/personalized"
import { Services } from "@/components/home/services"
import { Synastry } from "@/components/home/synastry"
import { Section } from "@/components/section"
import { SectionTitle } from "@/components/section-title"
import { SynastryFormSection } from "@/components/synastry/synastry-form-section"

export default function Page() {
  return (
    <>
      <Hero />
      <Services />
      <About />
      <Personalized />
      <Horoscope />
      <Synastry />
    </>
  )
}
