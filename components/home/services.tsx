/**
 * @module components/home/services
 *
 * Sección del landing que muestra las tres ofertas principales de Mystik:
 * Horóscopo Personalizado, Horóscopo Diario y Sinastría.
 * Los servicios se definen como un array estático y se renderizan
 * en una grilla 3-columnas con animaciones staggered.
 */
"use client"

import { motion } from "framer-motion"
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "../ui/card"
import Image from "next/image"

const servicesMeta = [
  { id: "personalized", image: "/aquarius.png", key: "personalized" },
  { id: "horoscope", image: "/virgo.png", key: "horoscope" },
  { id: "synastry", image: "/gemini.png", key: "synastry" },
] as const

export function Services() {
  const t = useTranslations("services")

  return (
    <section
      id="services"
      aria-label="Services"
      className="relative overflow-hidden bg-background py-24 select-none"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {servicesMeta.map((service) => (
            <motion.div
              key={service.id}
              className="group flex h-full"
              variants={staggerItem}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <button
                type="button"
                className="flex h-full w-full cursor-pointer text-left"
                onClick={() => {
                  const el = document.getElementById(service.id)
                  if (el) {
                    const top =
                      el.getBoundingClientRect().top + window.scrollY - 100
                    window.scrollTo({ top, behavior: "smooth" })
                  }
                }}
              >
                <Card className="h-full rounded-none border-2 border-star-dust-700 bg-background transition-colors duration-300 hover:border-primary/50">
                  <CardContent className="flex flex-col gap-4 p-8">
                    <figure className="mb-4 h-20 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={t(`${service.key}.title`)}
                        width={80}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </figure>
                    <h3 className="text-center font-title text-xl font-semibold text-primary transition-colors group-hover:text-primary">
                      {t(`${service.key}.title`)}
                    </h3>
                    <p className="text-center text-sm leading-relaxed text-muted-foreground">
                      {t(`${service.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
