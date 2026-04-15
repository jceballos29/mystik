/**
 * @module components/home/hero
 *
 * Sección hero del landing con imagen de fondo a pantalla completa,
 * efecto parallax basado en scroll (Framer Motion `useTransform`)
 * y animaciones staggered de entrada para badge, título, CTA y
 * un indicador de scroll animado.
 */
"use client"

import { fadeIn, staggerContainer, staggerItem } from "@/lib/motion"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { useRef } from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background"
    >
      <Image
        src="/hero.jpg"
        alt="Hero Image"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-linear-to-b from-background/50 to-background"></div>
      <motion.div
        style={{ y, opacity }}
        className="z-10 mx-auto max-w-7xl px-6 py-32 sm:px-10 sm:py-48 lg:p-56"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div variants={staggerItem}>
            <Badge
              variant="outline"
              className="mb-6 rounded-none border-primary/40 bg-primary/10 px-4 py-2 text-xs tracking-[0.2em] text-primary uppercase"
            >
              Holistic Healing &amp; Celestial Guidance
            </Badge>
          </motion.div>
          <motion.h1
            variants={staggerItem}
            className="mb-6 text-center font-title text-4xl font-bold tracking-wider text-balance text-primary md:text-5xl lg:text-6xl"
          >
            Discover what the stars have in store for you
          </motion.h1>
          <motion.p
            variants={staggerItem}
            className="mx-auto mb-10 max-w-2xl text-center leading-relaxed font-medium text-pretty text-muted-foreground"
          >
            Navigate the cosmos of your own existence. We interpret the
            celestial language to bring you clarity, purpose, and connection
            with the universe.
          </motion.p>
          <motion.div
            variants={staggerItem}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Button
              className="hover:bg-gold-dim cursor-pointer rounded-none bg-primary px-8 text-xs font-bold tracking-widest text-primary-foreground uppercase transition-colors"
              onClick={() =>
                document
                  .getElementById("services")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Services
            </Button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={fadeIn}
            className="mt-12 flex flex-col items-center gap-2 sm:mt-20"
          >
            <span className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
              Scroll
            </span>
            <motion.div
              className="h-12 w-px bg-primary/40"
              animate={{ scaleY: [0, 1, 0], originY: 0 }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
