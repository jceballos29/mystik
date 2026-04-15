/**
 * @module app/page
 *
 * Landing page de Mystik. Compone las 6 secciones del home en orden:
 * Hero → Services → About → Personalized → Horoscope Grid → Synastry Form.
 * Es una Server Component pura (sin directivas "use client").
 */
import { About } from "@/components/home/about"
import { Hero } from "@/components/home/hero"
import { Horoscope } from "@/components/home/horoscope"
import { Personalized } from "@/components/home/personalized"
import { Services } from "@/components/home/services"
import { Synastry } from "@/components/home/synastry"

/** Landing page: composición de las secciones del home. */
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
