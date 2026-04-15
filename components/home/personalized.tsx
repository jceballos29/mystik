/**
 * @module components/home/personalized
 *
 * Sección del landing que promueve el horóscopo personalizado.
 * Layout de dos columnas: imagen editorial a la izquierda y
 * formulario de datos de nacimiento (`BirthDetailsForm`) a la derecha.
 * Cada columna usa animaciones staggered independientes.
 */
"use client"

import {
  fadeIn,
  staggerContainer,
  staggerItem,
  viewportOnce,
} from "@/lib/motion"
import { motion } from "framer-motion"
import Image from "next/image"
import { BirthDetailsForm } from "../birth-details-form"

export function Personalized() {
  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      id="personalized"
      aria-label="Personalized Horoscope"
      className="relative flex items-center justify-center overflow-hidden bg-background"
    >
      <Image
        src="/hero.jpg"
        alt="Hero Image"
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-linear-to-b from-background/50 to-background"></div>
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid w-full items-center md:grid-cols-2"
        >
          <motion.div
            className="h-full overflow-hidden border border-star-dust-700"
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <Image
              src="/rodnae.jpg"
              alt="Personalized Astrology"
              width={1920}
              height={1080}
              className="h-full w-full object-cover"
            />
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="h-full border border-star-dust-700 bg-background p-10 py-16"
          >
            <motion.div variants={staggerItem}>
              <Image
                src={"/icon.png"}
                alt=""
                aria-hidden="true"
                width={500}
                height={500}
                className="h-12 w-20"
              />
            </motion.div>
            <motion.h2
              variants={staggerItem}
              className="mt-4 mb-6 scroll-m-20 font-title text-4xl font-bold tracking-wider text-balance text-primary first:mt-0"
            >
              Your Personal Cosmic Blueprint
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="mx-auto mb-8 max-w-3xl leading-relaxed text-muted-foreground"
            >
              Enter your birth details for a reading based on your unique natal
              chart and today&apos;s planetary transits
            </motion.p>

            <BirthDetailsForm />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
