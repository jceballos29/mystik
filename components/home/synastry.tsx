/**
 * @module components/home/synastry
 *
 * Sección del landing que contiene el formulario de sinastría.
 * Integra el componente `SynastryFormSection` dentro de un layout
 * con imagen de fondo y overlay gradiente.
 */
"use client"

import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion"
import Image from "next/image"
import { motion } from "framer-motion"
import { SynastryFormSection } from "../synastry/synastry-form-section"

export function Synastry() {
  return (
    <section
      id="synastry"
      className="relative flex min-h-96 items-center justify-center overflow-hidden bg-background"
    >
      <Image
        src="/footer.jpg"
        alt="Hero Image"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-linear-to-b from-background/50 to-background"></div>
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <motion.div
          className="text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="mb-4 flex flex-col items-center justify-center text-center">
            <Image
              src={"/icon.png"}
              alt="Icon"
              width={500}
              height={500}
              className="h-12 w-20"
            />
            <h2 className="mt-4 mb-8 scroll-m-20 font-title text-5xl font-semibold tracking-wider text-balance text-primary first:mt-0">
              Cosmic Compatibility
            </h2>
            <p className="mx-auto max-w-3xl text-center leading-relaxed text-muted-foreground">
              Discover the astrological dynamics between you and another person
            </p>
          </div>
        </motion.div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl p-8 sm:p-12"
        >
          <SynastryFormSection />
        </motion.div>
      </div>
    </section>
  )
}
