/**
 * @module components/home/horoscope
 *
 * Sección del landing que muestra la grilla de 12 signos zodiacales.
 * Cada tarjeta enlaza a `/horoscope/[sign]`. El estado de hover
 * se gestiona aquí para sincronizar la animación de la imagen del signo
 * con el hover del contenedor `motion.div`.
 */
"use client"

import {
  fadeUp,
  staggerContainer,
  staggerItem,
  viewportOnce,
} from "@/lib/motion"
import { zodiacSigns } from "@/lib/zodiac-signs"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ZodiacSignCard } from "../zodiac-sign-card"
import { useState } from "react"

export function Horoscope() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section
      id="horoscope"
      className="relative overflow-hidden bg-background py-24"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          className="mb-16 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="mb-20 flex flex-col items-center justify-center text-center">
            <Image
              src={"/icon.png"}
              alt="Icon"
              width={500}
              height={500}
              className="h-12 w-20"
            />
            <h2 className="mt-4 mb-8 scroll-m-20 font-title text-5xl font-semibold tracking-wider text-balance text-primary first:mt-0">
              Choose your zodiac sign
            </h2>
            <p className="mx-auto max-w-3xl text-center leading-relaxed text-muted-foreground">
              What&apos;s your sign? Discover your horoscope for today
            </p>
          </div>
        </motion.div>
        <motion.div
          className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {zodiacSigns.map((sign) => (
            <motion.div
              key={sign.name}
              variants={staggerItem}
              onHoverStart={() => setHovered(sign.name)}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
            >
              <Link
                href={`/horoscope/${sign.id}`}
                key={sign.id}
                className="w-full"
              >
                <ZodiacSignCard hovered={hovered === sign.name} sign={sign} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
