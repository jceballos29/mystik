/**
 * @module components/home/about
 *
 * Sección "About" del landing que describe la misión de Mystik.
 * Contenido estático con animación `fadeUp` al entrar al viewport.
 */
"use client"

import { motion } from "framer-motion"
import { fadeUp, viewportOnce } from "@/lib/motion"
import Image from "next/image"

export function About() {
  return (
    <section
      id="about"
      aria-label="About Holistic Healing"
      className="relative overflow-hidden bg-background py-24"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.header
          className="mb-20 flex flex-col items-center justify-center text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <Image
            src={"/icon.png"}
            alt=""
            aria-hidden="true"
            width={500}
            height={500}
            className="h-12 w-20"
          />
          <h2 className="mt-4 mb-8 scroll-m-20 font-title text-5xl font-semibold tracking-wider text-balance text-primary first:mt-0">
            About Holistic Healing
          </h2>
          <p className="mx-auto max-w-3xl text-center leading-relaxed text-muted-foreground">
            Mystik offers astrological counseling and Reiki energy healing to
            help clients reach their greatest potential. By understanding the
            role that planetary cycles play in their lives, clients are
            empowered to make better decisions resulting in more rewarding and
            fulfilling lives.
          </p>
        </motion.header>
      </div>
    </section>
  )
}
