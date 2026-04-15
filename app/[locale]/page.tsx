/**
 * @module app/[locale]/page
 *
 * Landing page localizada. Compone las secciones del home.
 */
import { About } from "@/components/home/about"
import { Hero } from "@/components/home/hero"
import { Horoscope } from "@/components/home/horoscope"
import { Personalized } from "@/components/home/personalized"
import { Services } from "@/components/home/services"
import { Synastry } from "@/components/home/synastry"

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
