"use client"

import { motion } from "framer-motion"
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion"
import { Card, CardContent } from "../ui/card"
import Image from "next/image"

const services = [
  {
    image: "/aquarius.png",
    title: "Personalized Horoscope",
    description:
      "Transit-based insights calculated from your natal chart for a reading that is uniquely yours.",
  },
  {
    image: "/virgo.png",
    title: "Daily Horoscope",
    description:
      "Get today's cosmic forecast for your zodiac sign — love, career, money, and health.",
  },
  {
    image: "/gemini.png",
    title: "Synastry",
    description:
      "Explore the astrological compatibility between two people with a full aspect-by-aspect report.",
  },
]

export function Services() {
  return (
    <section
      id="services"
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
          {services.map((service) => (
            <motion.div
              key={service.title}
              className="group block"
              variants={staggerItem}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <Card className="h-full rounded-none border-2 border-star-dust-700 bg-background transition-colors duration-300 hover:border-primary/50">
                <CardContent className="flex flex-col gap-4 p-8">
                  <figure className="mb-4 h-20 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                    />
                  </figure>
                  <h3 className="text-center font-title text-xl font-semibold text-primary transition-colors group-hover:text-primary">
                    {service.title}
                  </h3>
                  <p className="text-center text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
